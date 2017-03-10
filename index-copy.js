;(function (factory) {
    if (typeof define == 'function' && define.amd) {
        //seajs or requirejs environment
        define(['jquery','class','pager',"./dataTables.js","./dataTables.fixedColumns.min.js"], factory);
    } else if (typeof module === 'object' && typeof module.exports == 'object') {
        module.exports = factory(
            require('jquery'),
            require('class'),
            require('pager'),
            require("./jquery.dataTables.js"),
            require("./dataTables.fixedColumns.js")
        );
    } else {
        factory(window.jQuery);
    }
})(function ($) {


    /*为datagrid提供方法*/
    var dtValidate={
        colsObj:{},  /*每列对象*/
        // allColsArgs:{},
        everyColsObj:[],    /*获取columns的每个对象属性*/
        // ceng:0,
        group:[],         /*中间转换对象group*/
        group2:[],        /*中间转换对象group*/
        // finalArgs:{},
        rowIndexArgs:{},  /*最终渲染的tr的对象*/
        // trArgs:[],    /*z最终渲染的tr的对象*/
        maxTrLength:0,    /*最大行数*/
        /*过滤不必要的字段*/
        filter:function (fields){

            var keys=fields instanceof Object? Object.keys(fields):"";

            keys.map(function(v,k){
                if(CAN_FIELDS.indexOf(v)==-1){
                    delete fields[v];
                    return null;
                }else{
                    return v;
                }
            });

            return fields;

        },
        /*获取列数对象*/
        allColsObj:function (columns,totalColsArgs,totalCols,final,parentKey){
            var _self=this;

            columns.forEach(function(v,k){
                /*获取分类跨列数*/
                var obj={
                    length:v.columns.length,
                    parent:parentKey,
                    label:v.label,
                    className:v.className,
                    key:v.key,
                    maxCol:0,
                    rowIndex:1,
                    maxRow:0
                };


                _self.everyColsObj.push(obj);


                if(v.columns!=undefined&&v.columns instanceof Array&&v.columns.length>0){
                    _self.allColsObj(v.columns,totalColsArgs,totalCols,k,parentKey==undefined?v.key:parentKey+','+v.key);
                }
            });

        },


        /*获得总数*/
        getTotalCols:function(){
            var allNum=0;

            for(var k in this.colsObj){
                allNum+=this.colsObj[k];
            }

            return allNum;
        },

        /*将everyColsObj整合成分离对象，方便构建tr/td*/
        handleEveryColsObj:function(columns){
            var _self=this;
            console.log(_self.everyColsObj,434343);
            /*得到总列数*/
            for(var k in _self.everyColsObj){
                // _self.group[k]=[];
                _self.group.push(_self.everyColsObj[k]);
            }
            console.log(_self.everyColsObj,54545);
            _self.handleCols();

            console.log(_self.group2,868686);
            /*将maxCol最小赋予1*/
            for(var m in _self.group2){
                for(var k in _self.group2[m]){
                    if(_self.group2[m][k].maxCol==0){
                        _self.group2[m][k].maxCol=1;
                    }
                }

            }

            _self.handleRows();
            console.log(_self.group,_self.maxTrLength,7777);
            _self.handleGroupToTrGroup();
            // console.log(_self.rowIndexArgs,555);
            console.log(_self.trArgs,222222);
        },

        /*TODO::将数组重组为需要的结构*/
        handleGroupToTrGroup:function(){
            var _self=this,typeRowIndexArgs=[];



            for(var k in _self.group2){
                for (var i in  _self.group2[k]){
                    if(typeRowIndexArgs.indexOf(_self.group2[k][i].rowIndex)<0){
                        typeRowIndexArgs.push(_self.group2[k][i].rowIndex);
                    }
                }
            }


            typeRowIndexArgs.sort();
            console.log(typeRowIndexArgs,123456);

            typeRowIndexArgs.forEach(function(v,k){
                _self.rowIndexArgs[v]=[];
                for(var k in _self.group2){
                    for (var i in  _self.group2[k]){
                        if( _self.group2[k][i].rowIndex==v){
                            _self.rowIndexArgs[v].push(_self.group2[k][i]);
                        }
                    }
                }
            });
            console.log(_self.rowIndexArgs,6464677);



        },


        /*添加attr属性，并获取每个的最大列数*/
        handleCols:function(){
            var _self=this;

            var parentArgs=[];
            for(var i =0;i<_self.everyColsObj.length;i++){
                if(_self.everyColsObj[i].parent==undefined){
                    parentArgs.push(_self.group[i].key);
                }
            }

            console.log(parentArgs,6655);
            var o1={};

            for(var k in parentArgs) {
                o1[k] = {};
            }

            for(var k in parentArgs){
                for(var i in _self.group){

                    if(_self.group[i].parent==undefined&&_self.group[i].key==parentArgs[k]){
                        o1[k].attr=_self.group[i];
                        continue;
                    }

                    if(_self.group[i].parent!=undefined&&_self.group[i].parent.indexOf(parentArgs[k])>-1){
                        o1[k][i]=_self.group[i];

                    }

                }
            }
            console.log(o1,757575);
            /*一级分类计算maxCol*/
            for(var i in o1){
                for(var m in o1[i]){

                    if(m!="attr"&&o1[i][m].length==0){

                        o1[i].attr.maxCol++;

                    }

                }
            }

            /*非一级分类计算maxCol*/
            for(var i in o1){
                for(var m in o1[i]){
                    if(o1[i][m].parent!=undefined){

                        var key=o1[i][m].key;

                        for(var k in o1){
                            for(var j in o1[k]){
                                if(o1[k][j].parent!=undefined){
                                    var parentsArgs=o1[k][j].parent.split(",");
                                    if(parentsArgs.indexOf(key)>-1&&o1[k][j].length==0){
                                        o1[i][m].maxCol+=1;
                                    }
                                }
                            }
                        }
                    }
                }
            }



            console.log(o1,987987987);
            _self.group2=o1;

        },

        /*获取第几行和跨行几行*/
        handleRows:function(){
            var _self=this;

            for(var k in _self.everyColsObj){
                /*获取最大行数*/
                if(_self.everyColsObj[k].parent==undefined){
                    _self.maxTrLength=_self.maxTrLength>1?_self.maxTrLength:1;
                }else{
                    if(_self.everyColsObj[k].parent.indexOf(",")<0){
                        _self.maxTrLength=_self.maxTrLength>2?_self.maxTrLength:2;
                    }else{
                        if(_self.maxTrLength<=_self.everyColsObj[k].parent.split(",").length){
                            _self.maxTrLength=_self.everyColsObj[k].parent.split(",").length+1;
                        }
                    }
                }

            }

            /*获取处于第几个tr*/
            for(var m in _self.group2){
                for(var k in _self.group2[m]){

                    if( _self.group2[m][k].parent==undefined){
                        _self.group2[m][k].rowIndex=1;
                    }else if(_self.group2[m][k].parent.indexOf(",")<0){
                        _self.group2[m][k].rowIndex=2;
                    }else{
                        _self.group2[m][k].rowIndex=_self.group2[m][k].parent.split(",").length+1;
                    }
                }
            }

            console.log(_self.maxTrLength,858483);
            console.log(_self.group2,83748575643);

            /*获取跨行*/
            console.log(_self.everyColsObj,9999);
            for(var k in _self.group2){
                for(var m in _self.group2[k]) {

                    if(_self.group2[k][m].length == 0){
                        _self.group2[k][m].maxRow = _self.maxTrLength - _self.group2[k][m].rowIndex+1 ;
                    }else{
                        _self.group2[k][m].maxRow = 1;
                    }

                }
            }
            console.log( _self.group2,987654);

        },

        // /*深克隆对象*/
        // cloneCurrentObj:function (obj1,obj2) {
        //     var _self=this,obj2=obj2||{};
        //     for(var i in obj1){
        //         if(typeof obj1[i] == "object"){
        //             obj2[i]=(obj1[i].constructor==Array)?[]:{};
        //             _self.cloneCurrentObj(obj1[i],obj2[i]);
        //         }else{
        //             obj2[i]=obj1[i];
        //         }
        //     }
        //     return obj2;
        // },

        /*使用完毕初始化*/
        dtValidateDestory:function(){
            this. colsObj={};
            this.everyColsObj=[];
            this.group=[];
            this.group2=[];
            this.rowIndexArgs={};
            this.maxTrLength=0;
        }

    };


    /*datagrid构造函数*/

    var datagrid=function (ele,option){
        dg.initliaze(ele,option);
    };

    var dg=datagrid.prototype;

    dg.initliaze=function (ele,option){
        this.ele=ele;

        this.default={
            totalCols:0,
            totalColsArgs:{},
            newColumns:"",
            dataTable:"",
            aoData:[],
            beginOption:option
        };

        this.newOpt=dtValidate.filter.call(this,option);


        this.opt=$.extend({},this.newOpt,this.default);

        var _self=this;

        dtValidate.allColsObj(_self.opt.columns,_self.opt.totalColsArgs,_self.opt.totalCols);

        dtValidate.handleEveryColsObj(_self.opt.column);

        // this.newOpt.everyColsObj=dtValidate.everyColsObj;

        /*深克隆*/
        this.newOpt.everyColsObj = JSON.parse(JSON.stringify(dtValidate.everyColsObj));

        // this.opt.newColumns=dtValidate.rowIndexArgs;

        /*深克隆*/
        this.opt.newColumns = JSON.parse(JSON.stringify(dtValidate.rowIndexArgs));

        dtValidate.dtValidateDestory();

        console.log(dtValidate.rowIndexArgs,this.opt.newColumns,"memeda");

        this.init(this.ele,this.dataTable,this.opt);

    };


    // 表头初始化
    dg.init=function(ele,dt,defo){
        console.log(defo,"ueueu");
        var _self=this,
            trHtml="";

        for(var k in defo.newColumns){
            var tr="<tr>";
            defo.newColumns[k].forEach(function(v,m){
                tr+="<td colspan='"+ v.maxCol+"' rowspan='"+v.maxRow+"' class='"+v.className+"'>"+v.label+"</td>";
            });
            tr+="</tr>";
            trHtml+=tr;
        }

        var tableHtml='<table cellspacing="0" width="100%">'+
            '<thead>'+
            trHtml+
            '</thead>'+
            '</table>'+
            '<div id="pager"></div>';
        console.log(ele);
        ele.html(tableHtml);
        /*初始化dtValidate对象属性，方便创建第二个table*/
        // dtValidate.dtValidateDestory();
        // console.log(this.opt.newColumns,"memeda");
        // console.log(this.newOpt.newColumns,"mememda")
        this.createDataTable(ele,dt,defo);
        return this;

    };

    /*ajax重写为source*/
    const CAN_FIELDS=['columns','pagerOptionsFormat','source','itemFormat',
        'fixedColumns','columnDefs','aoColumns','scrollY','scrollX','pagerOptionsFormat'];

    /*dataTable初始化*/
    dg.createDataTable=function(ele,dt,opt){
        console.log(opt,333);
        var _self=this;

        /*防止与dataTable属性冲突*/
        if(opt.hasOwnProperty("columns")){
            delete opt.columns;
        }

        opt.dtDefaultOpt={
            scrollX:true,
            paging:false,
            scrollCollapse: true,
            columns:[],
            ajax:{},
            searching: false,
        };

        var dtDefaultOpt=opt.dtDefaultOpt;
        for(var k in opt.everyColsObj){
            if(opt.everyColsObj[k].length==0){
                var obj={
                    "data":opt.everyColsObj[k].key
                };
                dtDefaultOpt.columns.push(obj);
            }
        }


        // opt.aoData=[];
        /*将自定于方法赋予dataTable*/
        dtDefaultOpt.ajax.url=opt.source.ajaxUrl;
        dtDefaultOpt.ajax.data=opt.source.requestData;
        dtDefaultOpt.ajax.dataSrc=opt.source.dataSrc;
        dtDefaultOpt.aoColumns=opt.source.itemFormat;
        dtDefaultOpt.fixedColumns=opt.fixedColumns;
        dtDefaultOpt.scrollY=opt.scrollY;
        dtDefaultOpt.scrollX=opt.scrollX;
        // dtDefaultOpt.scrollCollapse=true;
        // dtDefaultOpt.bProcessing=opt.source.bProcessing;
        // dtDefaultOpt.bServerSide=opt.source.bServerSide;
        dtDefaultOpt.fnServerParams=function(aoData){
            for(var k in opt.source.requestData){
                var obj={name:k,value:opt.source.requestData[k]};
                aoData.push(obj);
            }
        };

        console.log(dtDefaultOpt,6565);

        dtDefaultOpt.columns.forEach(function(v,k){
            console.log(v);
            delete v.mData;
        });

        dt=ele.find("table").DataTable(dtDefaultOpt);
        this.createPager(ele,dt,opt);
        return this;
    };

    /*创建页面*/
    dg.createPager=function(ele,dt,opt){
        var beginOption=opt.beginOption,source=opt.beginOption.source;

        $("#pager").pager({
            total: opt.pagerOptionsFormat().total/ opt.pagerOptionsFormat().perPage,
            current: source.requestData.iPage? source.requestData.iPage:1,
            showFirstBtn: false
        }).on("pager:switch", function(event, index){
            console.log(opt.dtDefaultOpt);
            var page=beginOption.pagerOptionsFormat();
            beginOption.pagerOptionsFormat=function () {
                return {
                    countPrePage: index,
                    total:  page.total,
                    perPage:  page.perPage
                }
            };
            opt.dtDefaultOpt.iPager=index;

            source.requestData.iPage=index;

            dg.destory(ele);

            dg.initliaze(ele,beginOption);

        });
    };


    //销毁datatable
    dg.destory=function(ele){
        ele.find("table").length>0&&ele.html("");
    };


    //新增jquery扩展函数dataTables
    $.fn.datagrid = function (option) {
        return new datagrid(this,option);
    };

});
