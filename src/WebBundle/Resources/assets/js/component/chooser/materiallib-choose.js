/**
 * Created by Simon on 31/10/2016.
 */

var $parentiframe = $(window.parent.document).find('#task-manage-content-iframe');

class MaterialLibChoose {

    constructor($container) {
        this.container = $container;
        this.loadShareingContacts = false;
        this._init();
        this._initEvent();
    }

    _init() {
        this._loadList();
    }

    _initEvent() {
        $(this.container).on('click', '.js-material-type', this._switchFileSource.bind(this));
        $(this.container).on('change', '.js-file-owner', this._fileterByFileOwner)
        $(this.container).on('click', '.js-browser-search', this._fileterByFileName.bind(this));
        $(this.container).on('click', '.pagination a', this._paginationList.bind(this));
        $(this.container).on('click', '.file-browser-item', this._onSelectFile.bind(this));
        $('.js-choose-trigger').on('click', this._open)
    }

    _loadList() {
        let url = $('.js-browser-search').data('url');

        let params = {};
        params.sourceFrom = $('input[name=sourceFrom]').val();
        params.page = $('input[name=page]').val();
        params.type = $('input[name=type]').val();
        $('.js-material-list').load(url, params, function () {
            $parentiframe.height($parentiframe.contents().find('body').height());
        })

    }

    _paginationList(event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        let $that = $(event.currentTarget);

        let page = this._getUrlParameter($that.attr('href'), 'page');
        $('input[name=page]').val(page);
        this._loadList();
    }

    _switchFileSource(event) {
        let that = event.currentTarget;
        var type = $(that).data('type');
        console.log('type', type)
        $(that).addClass('active').siblings().removeClass('active');
        $('input[name=sourceFrom]').val(type);
        switch (type) {
            case 'my' :
                $('.js-file-name-group').removeClass('hidden');
                $('.js-file-owner-group').addClass('hidden');
                break;
            case 'sharing':
                this._loadSharingContacts.call(this, $(that).data('sharingContactsUrl'));
                $('.js-file-name-group').removeClass('hidden');
                $('.js-file-owner-group').removeClass('hidden');
                break;
            default:
                $('.js-file-name-group').addClass('hidden');
                $('.js-file-owner-group').addClass('hidden');
                break;
        }
        this._loadList();
    }

    _loadSharingContacts(url) {
        if (this.loadShareingContacts == true) {
            console.error('teacher list has been loaded');
            return;
        }
        $.get(url, function (teachers) {
            if (Object.keys(teachers).length > 0) {
                var html = `<option value=''>${Translator.trans('请选择老师')}</option>`;
                $.each(teachers, function (i, teacher) {
                    html += `<option value='${teacher.id}'>${teacher.nickname} </option>`
                });

                $(".js-file-owner", self.element).html(html);
            }

        }, 'json');
        this.loadShareingContacts = true;
    }


    _fileterByFileName() {
        let keyword = $('.js-file-name').val();

        let params = {};
        params.keyword = keyword
        params.sourceFrom = $('input[name=sourceFrom]').val();
        params.page = $('input[name=page]').val();

        let url = $('.js-browser-search').data('url');
        $('.js-material-list').load(url, params, function () {
            console.log('page is reloading')
        })
    }

    _fileterByFileOwner() {
        let params = {};
        params.keyword = $('.js-file-name').val();
        params.currentUserId = $('.js-file-owner option:selected').val();
        params.sourceFrom = $('input[name=sourceFrom]').val();
        params.page = $('input[name=page]').val();

        let url = $('.js-browser-search').data('url');
        $('.js-material-list').load(url, params, function () {
            console.log('page is reloading')
        })
    }

    _close() {
        $('.file-chooser-main').addClass('hidden');
        $('.file-chooser-bar').removeClass('hidden');
        $parentiframe.height($parentiframe.contents().find('body').height());
    }

    _open() {
        $('.file-chooser-bar').addClass('hidden');
        $('.file-chooser-main').removeClass('hidden');
        $parentiframe.height($parentiframe.contents().find('body').height());
    }

    _onSelectFile(event) {
        var $that = $(event.currentTarget);
        var file = $that.data();
        this._onChange(file);
        this._close();
    }

    _onChange(file) {
        var value = file ? JSON.stringify(file) : '';
        $('[name="media"]').val(value);
        $('[data-role="placeholder"]').html(file.name);
        this._fillMinuteAndSecond(file.length);
    }

    _fillMinuteAndSecond(fileLength) {
        let minute = parseInt(fileLength / 60);
        let second = Math.round(fileLength % 60);
        $("#minute").val(minute);
        $("#second").val(second);
    }

    _getUrlParameter(url, param) {
        var sPageParams = url.split('?');
        if (sPageParams && sPageParams.length == 2) {
            var sPageURL = decodeURIComponent(sPageParams[1]);
            var sURLVariables = sPageURL.split('&');
            for (let i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === param) {
                    return sParameterName[1] === undefined ? null : sParameterName[1];
                }
            }
        }
        return null;

    }

}


new MaterialLibChoose($('#chooser-material-panel'));
