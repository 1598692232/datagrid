# datagrid基于jquery.dataTable的插件

## 说明
将table常用功能进行整合，并且自动生成Table元素，结合legoland样式

## 安装
    bower install feather-components/datagrid 
    feather2 install feather-components/datagrid 
    
## 引入
普通引入

```html
    <link rel="stylesheet" href="../jquery.dataTables.css" media="screen" title="no title" charset="utf-8">
    <link rel="stylesheet" href="../bower_components/pager/index.css" media="screen" title="no title" charset="utf-8">
    <link rel="stylesheet/less" href="../bower_components/legoland/src/legoland.css" media="screen" title="no title" charset="utf-8">

    <script type="text/javascript" src="../class/index.js"></script>
    <script type="text/javascript" src="../pager/index.js"></script>
    <script src="../jquery.dataTables.js"></script>
    <script src="../dataTables.fixedColumns.js"></script>
    <script src="../index.js"></script>
```

feather2引入
由于已经引入'class','pager','legoland',"./dataTables.js","./dataTables.fixedColumns.min.js"，所以可用如下方式
```html
    require.ansyc("datagrid");

```


## 使用
```html
 <div class="" id="dt"></div>
 $("#dt").datagrid({
   columns: [
             {
               key: 'username',
               label: '用户名',
               className: '',
               columns: []
             },
             {
               key: 'sex',
               label: '性别',
               className: '',
               columns: []
             },
             {
               key: 'oldAge',
               label: '周岁',
               className: '',
               columns: []
             },
             {
               key: 'newAge',
               label: '虚岁',
               className: '',
               columns: []
             },
             {
               key: 'tizhong',
               label: '体重',
               className: '',
               columns: [
                 {
                   key: 'tizhong1',
                   label: '体重1',
                   className: '',
                   columns: []
                 },
                 {
                   key: 'tizhong2',
                   label: '体重2',
                   className: '',
                   columns: []
                 }
               ]
             },
             {
               key:"do",
               label: '操作',
               className: '',
               columns: [],
               format:function(obj){
                 return '<a data-toggle="modal" data-target="#myModal"  data-title="1"  class="btn btn-success" href="#"><i class="icon-edit icon-white"></i>修改</a>' +'&nbsp;&nbsp;'+'<a   data-title="2"  class="btn btn-danger" href="#"><i class="icon-user icon-white"></i>删除</a>';
               }
             },
           ],
           source: {
               ajaxUrl:"./a.json" ,
               requestData: {
                 a:"qeqwe",
                 id:"555",
                 name:"55kai",
                 iPage:4
               },
               dataSrc:"data.aData",
               dataTotal:"data.iTotal",
           },
 })
```

## 选项

| 选项 | 默认值 | 必填 | 说明 |
|----------|----------|----------|----------|
| columns | / | Y | 字段列名（Array）（key字段名，必填且唯一/label表头显示名称，必填/className样式class，选填/columns子类，选填），该字段可实现多个分类，key值不仅用于创建表头，还对应请求的数据相应的字段才可显示数据|
| source | / | Y | 用于数据请求（Object）（ajaxUrl:请求路径，必填/dataSrc:请求的数据列表字段如（data.aData），必填/requestData:请求对象,选填）/dataTotal:请求的数据总数如（data.iTotal）/currentPageField:requestData的页码字段。dataTotal和 currentPageField需要pagerOptionsFormat属性才起作用|
| pagerOptionsFormat | / | N | 页码对象（function）返回必须是对象，且有属性perPage（每页数量） |
| scrollY | / | N | 表格高度且滚动（int） |
| scrollX | false | N | 是否横向滚动 （boolean）|
| fixedColumns | /| N | 列固定（array）如[1,2],左边第一列，右边第一第二列不能滚动 |

## 事件

| 事件 | 说明 |
|----------|----------|
| datagrid:success | 渲染成功 |
|datagrid:error| 渲染失败 |
 datagrid:mouseleave |鼠标滑上事件 (回调参数colObj,colNode,allColNodes)|
 datagrid:mouseleave |鼠标离开事件（回调参数allColNodes） |




