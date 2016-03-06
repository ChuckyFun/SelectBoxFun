/**
 *
 * jQuery SelectBox Plugin
 *
 * Author: ChuckyFun
 * Date: 05.03.2016
 *
 */
(function($){

    var render = function(str,attrArr) {
        if(!attrArr) return str;
        for(var key in attrArr) {
            str = str.replace('{' + key + '}', attrArr[key]);
        }
        return str;
    };

    var selectBoxWrapTemplate = '<div class="{class}" id="{id}">{content}</div>',
        selectBoxOptionsListTemplate = '<ul class="{class}" id="{id}">{content}</ul>',
        selectBoxOptionTemplate = '<li class="{class}" id="{id}">{content}</li>';

    $.fn.CFSelectBox = function ( args ) {

        args = args || {};

        args = $.extend({
            selectBoxWrapTemplate           : selectBoxWrapTemplate,
            selectBoxWrapClass              : 'cf_select_box_wrap',
            dropdownTogglerTemplate         : selectBoxWrapTemplate,
            dropdownTogglerClass            : "cf_select_box_dropdown_toggler",
            selectedTemplate                : selectBoxWrapTemplate,
            selectedClass                   : "cf_select_box_selected",
            arrowTemplate                   : selectBoxWrapTemplate,
            arrowClass                      : "cf_select_box_arrow",
            arrowContent                    : "",
            dropDownTemplate                : selectBoxWrapTemplate,
            dropDownClass                   : "cf_select_box_dropdown",
            optionsListTemplate             : selectBoxOptionsListTemplate,
            optionListClass                 : "cf_select_box_option_list",
            optionTemplate                  : selectBoxOptionTemplate,
            optionClass                     : "cf_select_box_option",
            scrollItemLimit                 : 9,
            scrollMaxHeight                 : 180,
            usePerfectScroll                : false,
            type                            : 'all' // all or single
        }, args);

        function cf_window_click_events() {
            // Boş alana tıklandığında açık paneller kapansın
            $(document).on('click',function(e){

                // Kullandığımız elementlerden bir tanesinde ise işlem yapmasın
                if($(e.target).hasClass(args.selectBoxWrapClass)) {
                    return false;
                }

                if($(e.target).hasClass(args.dropdownTogglerClass)) {
                    return false;
                }

                if($(e.target).hasClass(args.selectedClass)) {
                    return false;
                }

                if($(e.target).hasClass(args.arrowClass)) {
                    return false;
                }

                if($(e.target).hasClass(args.dropDownClass)) {
                    return false;
                }

                if($(e.target).hasClass(args.optionListClass)) {
                    return false;
                }

                if($(e.target).hasClass(args.optionClass)) {
                    return false;
                }

                var opened_object = $('.' + args.selectBoxWrapClass + '.opened');

                opened_object.find('.' + args.dropDownClass).hide();
                opened_object.removeClass('opened');

            });
        }

        function cf_select_option(selectBox,options) {
            // Seçim yapıldığında yapılan işlemler
            targetSelectBox.find('.' + args.optionClass).unbind().on('click',function(e){
                var thisOption = $(this);
                thisOption.parent().parent().parent().find('.' + args.selectedClass).html(thisOption.html());
                options.removeAttr('selected');
                options.eq(thisOption.index()).attr('selected','selected');
                selectBox.val(options.eq(thisOption.index()).val()).change(); // Bu şekilde yapmazsak jquery change fonksiyonu ile takip edemiyoruz.
                thisOption.parent().parent().toggle();
                thisOption.parent().parent().parent().toggleClass('opened');
            });
        }

        function cf_close_options() {
            // Seçenekleri aç/kapat
            targetSelectBox.find('.' + args.dropdownTogglerClass).on('click',function(e){
                $(this).next().toggle();
                $(this).parent().toggleClass('opened');
            });
        }

        function cf_set_scrollbar(len) {
            // Eğer seçenek sayısı limitten azsa scroll göstermiyoruz.
            if(len < args.scrollItemLimit) {
                targetSelectBox.find('.' + args.optionListClass).css('overflow','hidden');
            } else {
                targetSelectBox.find('.' + args.optionListClass).css({
                    'max-height': args.scrollMaxHeight,
                    'overflow': 'scroll',
                    'overflow-x': 'hidden'
                });
                if(args.usePerfectScroll == true) {

                    if(typeof $.fn.perfectScrollbar === 'function') {

                        targetSelectBox.find('.' + args.optionListClass).css({
                            'overflow': 'visible',
                            'max-height': 'none'
                        });
                        targetSelectBox.find('.' + args.dropDownClass).css({
                            'height': args.scrollMaxHeight,
                            'position': 'relative'
                        });
                        targetSelectBox.find('.' + args.dropDownClass).perfectScrollbar();

                    } else {

                        console.log("Uyarı: perfectScrollbar bulunamadığı için aktif edilemedi.");

                    }

                }
            }
        }

        function cf_init(selectBox,len,options,output){

            // Select objesini gizliyoruz
            selectBox.css('display','none');

            // Select box yapısı hazırlanıyor
            for(var x=0; x<len; x+=1) {

                currentOption = options[x];
                output.push(render(args.optionTemplate, {
                    'class': options[x].className + ' ' + args.optionClass,
                    'content': options[x].innerHTML,
                    'id': 'cf_custom_selectbox_option_' + name + '_' + x
                }));

            }

            output = render(args.optionsListTemplate, {
                'class': args.optionListClass,
                'content': output.join(''),
                'id': 'cf_custom_selectbox_optionlist_' + name
            });

            output = render(args.dropDownTemplate, {
                'class': args.dropDownClass,
                'content': output,
                'id': 'cf_custom_selectbox_dropdown_' + name
            });

            output = [
                render(args.dropdownTogglerTemplate, {
                    'class': args.dropdownTogglerClass,
                    'content': [
                        render(args.selectedTemplate, {
                            'class': args.selectedClass,
                            'content': options.filter(":selected").html(),
                            'id': 'cf_custom_selectbox_selected_' + name
                        }),
                        render(args.arrowTemplate, {
                            'class': args.arrowClass,
                            'content': args.arrowContent,
                            'id': 'cf_custom_selectbox_arrow_' + name
                        })
                    ].join(''),
                    'id': 'cf_custom_selectbox_toggler_' + name
                }),
                $('<div>').append($(output).hide()).remove().html()
            ].join('');

            output = render(args.selectBoxWrapTemplate, {
                'class': args.selectBoxWrapClass,
                'content': output,
                'id': 'cf_custom_selectbox_wrap_' + name
            });

            // Hazırlanan objeyi ekle
            if(args.type == 'all') {
                $('body').find('#cf_custom_selectbox_wrap_' + name).remove(); // her ihtimale karşı zaten varsa siliyoruz
            }
            selectBox.after(output);

            targetSelectBox = selectBox.next();
        }

        if(args.type == 'all') {

            console.log("All çağırıldı.");

            return this.each(function(){

                var selectBox = $(this),
                    options = selectBox.find('option'),
                    name = selectBox.attr("name"),
                    output = [],
                    x = 0, len = options.length,
                    currentOption, currentOptionClasses, currentOptionContent;

                cf_init(selectBox,len,options,output);

                cf_set_scrollbar(len);

                cf_close_options();

                cf_select_option(selectBox,options);

                cf_window_click_events();

            });

        } else if(args.type == 'single') {

            console.log("Single çağırıldı.");

            var selectBox = this,
                options = selectBox.find('option'),
                name = selectBox.attr("name"),
                output = [],
                x = 0, len = options.length,
                currentOption, currentOptionClasses, currentOptionContent;

            cf_init(selectBox,len,options,output);

            cf_set_scrollbar(len);

            cf_close_options();

            cf_select_option(selectBox,options);

            cf_window_click_events();

        }

    }

})(jQuery);