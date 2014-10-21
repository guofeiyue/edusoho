define(function(require, exports, module) {
    window.$ = window.jQuery = require('jquery');
    require('placeholder');

    require('bootstrap');
    require('common/bootstrap-modal-hack2');
    var Notify = require('common/bootstrap-notify');

    exports.load = function(name) {
        var guideDiv=$(".user-guide");
        var completedDiv=$(".completed");
        //每次进入显示判断
        $.get($('#user-guide-path').data('url'),function(data){
            if(!isNaN(data.index)){//有index则显示右下角简短步骤
                guideDiv.find(".text").html(data.content);
                guideDiv.find(".view-step").data().index=data.index;
                guideDiv.find(".complete-step").data().index=data.index;
                guideDiv.show();
                completedDiv.find(".percent").html(data.index+"/5");
                completedDiv.show();
            }else if(data){//无index则为显示具体步骤提示modal框
                $('#step-modal').html(data).modal('show');
            }else{
                //完全不显示
            }
        });


        //关闭modal框时显示右下快捷栏
        $('#step-modal').on('hidden.bs.modal', function (e) {
            guideDiv.find(".text").html($(this).find("#guideContent").val());
            guideDiv.find(".view-step").data().index=$(this).find("#guideIndex").val();
            guideDiv.find(".complete-step").data().index=$(this).find("#guideIndex").val();
            guideDiv.slideDown('fast');
            completedDiv.find(".percent").html($(this).find("#guideIndex").val()+"/5");
            completedDiv.slideDown('fast');
        });

        guideDiv.unbind();

        //点击查看时显示modal框
        guideDiv.on('click',".view-step",function(){
            $.get($(this).data('url')+'?index='+$(this).data('index'),function(html){
                if(html){
                    $('#step-modal').html(html).modal('show');
                    guideDiv.slideUp("fast");
                    completedDiv.slideUp('fast');
                }else{
                    Notify.danger('步骤参数错误！');
                }   
            });
        });

        //点击完成
         guideDiv.on('click',".complete-step",function(){
            $.get($(this).data('url')+'?index='+$(this).data('index'),function(html){
                if(html=='finished'){
                    Notify.success('完成引导');
                    guideDiv.slideUp("fast");
                    completedDiv.slideUp('fast');
                }else if(html){
                    Notify.success('完成步骤');
                    $('#step-modal').html(html).modal('show');
                    guideDiv.slideUp("fast");
                    completedDiv.slideUp('fast');
                }else{
                    Notify.danger('尚未完成该步骤');
                }
            });
        });

        if (window.app.jsPaths[name.split('/', 1)[0]] == undefined) {
            name = window.app.basePath + '/bundles/topxiaadmin/js/controller/' + name;
        }

        name += '.js?' + window.app.version;

        seajs.use(name, function(module) {
            if ($.isFunction(module.run)) {
                module.run();
            }
        });

    };
    
    window.app.load = exports.load;

    if (app.controller) {
        exports.load(app.controller);
    }

    $( document ).ajaxSend(function(a, b, c) {
        if (c.type == 'POST') {
            b.setRequestHeader('X-CSRF-Token', $('meta[name=csrf-token]').attr('content'));
        }
    });

});