<!--
  主页面视图
  next version:
-->
<template>
  <div class="layout">
    <Layout :style="{height:'100vh'}">
      <Header>
        <h2 @click="about.show=true">{{resource.label}} <sup>{{apiDoc.info.version || ''}}</sup></h2>
        <About :show="about.show" :content="about" @click="about.show=false"/>
        <Select class="select" v-model="selectResource" label-in-value @on-change="changeResource($event)">
          <Option v-for="(item,index) in resources" :value="item.location" :key="index">{{item.name}}</Option>
        </Select>
      </Header>
      <Layout>
        <Sider :style="{overflow: 'auto'}" width="280">
          <ApiMenu :menus="apiMenu" :paths="apiDoc.paths"/>
        </Sider>
        <Layout>
          <Content :style="{padding: '24px',height: '100%'}">
            <Content :style="{background: '#fff'}">
              <router-view/>
            </Content>
          </Content>
        </Layout>
      </Layout>
      <Footer class="layout-footer-center">2017-{{new Date().getFullYear()}} &copy; CodeArtist</Footer>
    </Layout>
  </div>
</template>

<script>
  import ApiMenu from "../components/ApiMenu";
  import About from "../components/About";

  export default {
    components: {About, ApiMenu},
    data() {
      return {
        // 接口资源信息，可以多个，通过选择器来选择
        resources: [],
        // 通过选择器选中的当前资源
        resource: {label: 'SwaggerUI'},
        // 通过选择器选中的当前资源的值，用来绑定默认值
        selectResource: '',
        // 当前选择的接口资源
        apiDoc: {
          // 定义info字段防止空指针
          info: {}
        },
        // 通过接口的tag解析成页面菜单
        apiMenu: [],
        // 展示关于信息框状态控制
        about: {show: false}
      }
    },
    methods: {
      /**
       * 选择器选择事件，更改接口资源
       */
      changeResource(value) {
        this.resource = value;
        this.getApiDoc();
      },
      /**
       * 加载接口资源信息
       */
      getResources(callback) {
        this.ajax.get('/swagger-resources', data => {
          this.resources = data;
          this.resource.label = data[0].name;
          this.resource.value = data[0].location;
          this.selectResource = data[0].location;
          callback();
        });
      },
      /**
       * 加载对应选择的资源
       */
      getApiDoc() {
        this.ajax.get(this.selectResource, data => {
        // this.ajax.get('/v2/swagger.json', data => {
          this.apiDoc = data;
          sessionStorage.definitions = JSON.stringify(data.definitions);
          this.parseAbout();
          this.parseApiMenu();
        });
      },
      /**
       * 从接口资源解析关于信息框内容
       */
      parseAbout() {
        let [about, apiDoc] = [this.about, this.apiDoc];
        about.title = apiDoc.info.title;
        about.host = apiDoc.host;
        about.version = apiDoc.info.version;
        about.description = apiDoc.info.description;
        about.swagger = apiDoc.swagger;
      },
      /**
       * 从接口资源中解析页面菜单
       */
      parseApiMenu() {
        const [tags, paths] = [this.apiDoc.tags, this.apiDoc.paths];
        let menusArr = this.apiMenu;
        for (let i = 0, n = tags.length; i < n; i++) {
          let menus = {};
          menus.name = tags[i].name;
          menus.description = tags[i].description;
          let smArr = [];
          for (let path in paths) {
            for (let methods in paths[path]) {
              const method = paths[path][methods];
              if (method.tags.indexOf(tags[i].name) > -1) {
                let sm = {};
                sm.name = method.summary;
                sm.description = path;
                sm.url = path;
                smArr.push(sm);
                break;
              }
            }
          }
          menus.menus = smArr;
          menusArr.push(menus);
        }
      }
    },
    /**
     * 组件加载后加载资源
     */
    mounted() {
      this.getResources(() => this.getApiDoc());
      // this.getApiDoc();
    }
  }
</script>

<style scoped>

  h2 {
    color: #fff;
    text-align: left;
    display: inline-block;
  }

  .select {
    width: 200px;
    float: right;
    padding: 15px 0;
  }

  .layout-footer-center {
    padding: 0;
    width: 100%;
    height: 30px;
    color: #fff;
    background: #515a6e;
    text-align: center;
    line-height: 30px;
  }

</style>