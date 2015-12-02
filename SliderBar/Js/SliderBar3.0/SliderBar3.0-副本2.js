/// <reference path="jquery-1.8.2.js" />
/*
* 简单滑块切换 3.0
*/
/*
*1.取消 多滑块功能
*2.代码重构
*3.添加上下切换方式
*4.添加无间隙 滚动方式
*/
(function ($) {
    //滑块类声明
    //var timer;//自动滚动的计时器变量
    var SliderBar = function (elem, opts) {
        var _this = this;
        this.elem = elem;
        //默认参数设置
        var defaults = {
            width: 800,//外部容器的宽和高
            height: 300,
            containerWidth: 450,//内部容器的宽和高
            containerHeight: 200,
            itemWidth: 450,//每一项的宽和高
            itemHeight: 200,
            btnHorizontalMargin: 20,//切换按钮 距离两边的距离
            displayCount:1,//可显示的个数
            markingSite: 'center',//标示按钮位置 'center':居中,left:居左,right:居右
            markingType: 'number',//标示按钮的类型，默认number，还有circle,square
            markingMarginBottom: 10,//标示按钮到底部的距离

            showType: 'horizontal',//指定切换方式,horizontal:水平切换，vertical:垂直切换,opacity:渐变切换
            runType: 'single',//指定滚动方式，gapless 无间隙滚动, single 简单单方向滚动
            direction: 'rtl',//指定默认滚动的方向 ltr--左向右，rtl---右向左
            showTime: 1000,//指定 切换的时间间隔
            showBtn: true,//指定是否显示切换按钮
            showMarking: true,//是否显示 标示按钮:数字按钮，圆圈按钮
            loopRun: false,//指示是否循环播放
            autoRun: false, //指明是否自动滚动 
            autoRunTime: 2500,//指定 自动滚动时间间隔

            runHandler: function (index) { },
            leftHandler: function (index) { },
            rightHandler: function (index) { }
        }
        //根据切换类型，设置切换的间隔
        if (defaults.showType == 'opacity') {
            defaults.showTime = 300;
        }


        this.opts = $.extend({}, defaults, opts);
        var _opts = this.opts;
        //设置无间隙 滚动时间
        if (_opts.runType == 'gapless' && opts.showTime == undefined) {
            _opts.showTime = 500;
        }
    }
    //var timer;//自动滚动的计时器变量
    SliderBar.prototype.timer = undefined;
    //获取div
    function getDivByClass(cls) {
        var div = $('<div />');
        div.addClass(cls);
        return div;
    }
    //滑块类 方法
    SliderBar.prototype = {
        /*****对外可见方法*****/
        init: function () {
            var _elem = this.elem;
            var _opts = this.opts;
            var _this = this;
            //1.外部容器样式控制
            initOuter();
            //2.内部容器样式控制
            initInner();
            //3.切换按钮
            if (_opts.showBtn)
                initBtn();
            else {
                _elem.remove('.leftBtn').remove('.rightBtn');
            }
            //4.标示按钮--- 时显示
            if (_opts.showMarking)
                initMarkingBtn();
            else {
                _elem.remove('.num');
            }
            //5.初始化定时器 设置
            if (_opts.autoRun)
                _this.autoRunStart();


            //外部容器
            function initOuter() {
                //宽度高度
                _elem.width(_opts.width).height(_opts.height);
                _elem.on('mouseenter', function () {
                    _this.autoRunStop();
                }).on('mouseleave', function () {
                    _this.autoRunStart();
                });
            }
            //内部容器
            function initInner() {
                //宽度高度，位置
                var inner = _elem.find('.sliderContainer');
                inner.width(_opts.containerWidth).height(_opts.containerHeight);
                var vTop = (_elem.height() - inner.height()) / 2;
                var vLeft = (_elem.width() - inner.width()) / 2;
                inner.css({top:vTop,left:vLeft});

                //显示行 样式
                var slider = _elem.find('.slider');
                var liList = slider.find('li');
                //判断显示方式
                if (_opts.showType == 'horizontal') {
                    //判断滚动方式
                    if (_opts.runType == 'single') {
                        var hWidth = liList.length * _opts.itemWidth;
                        slider.width(hWidth);
                    }
                    else if (_opts.runType == 'gapless') {
                        //设置宽度
                        var hWidth = liList.length * _opts.itemWidth;
                        slider.width(hWidth);
                        _this.initGapless();
                    }
                } else if (_opts.showType == 'vertical') {
                    var vHeight = liList.length * _opts.itemHeight;
                    slider.height(vHeight);
                } else if (_opts.showType == 'opacity') {
                    liList.css({
                        position: 'absolute'
                    });
                    liList.fadeTo(0, 0);
                    liList.first().fadeTo(0, 1);
                }
                //单项样式
                liList.width(_opts.itemWidth).height(_opts.itemHeight);
            }
            //切换按钮
            function initBtn() {
                //左按钮
                _elem.remove('.leftBtn').append(getDivByClass('leftBtn btn'));
                var leftBtn = _elem.find('.leftBtn');
                var btnTop = (_elem.height() - leftBtn.height()) / 2;
                leftBtn.css({
                    top: btnTop,
                    left: _opts.btnHorizontalMargin
                });
                leftBtn.click(function () {
                    _this.leftRun();
                }).hover(function () {
                    leftBtn.addClass('backDiv-hover');
                }, function () {
                    leftBtn.removeClass('backDiv-hover');
                });
                leftBtn.remove('.backDiv').append(getDivByClass('backDiv'));
                leftBtn.remove('.imgDiv').append(getDivByClass('imgDiv'));
                //右按钮
                _elem.remove('.rightBtn').append(getDivByClass('rightBtn btn'));
                var rightBtn = _elem.find('.rightBtn');
                rightBtn.css({
                    top: btnTop,
                    right: _opts.btnHorizontalMargin
                }).click(function () {
                    _this.rightRun();
                }).mouseenter(function () {
                    rightBtn.addClass('backDiv-hover');
                }).mouseleave(function () {
                    rightBtn.removeClass('backDiv-hover');
                });
                rightBtn.remove('.backDiv').append('<div class="backDiv"/>');
                rightBtn.remove('.imgDiv').append('<div class="imgDiv"/>');
            }
            //切换标示按钮
            function initMarkingBtn() {
                //1.创建按钮
                var inner = _elem.find('.sliderContainer');
                var slider = inner.find('.slider');
                var liList = slider.find('li');

                //如果显示多个
                if (_opts.displayCount > 1)
                    return;
                inner.remove('.num').append('<ul class="num"/>');
                var num = inner.find('.num');
                for (var i = 1; i <= liList.length; i++) {
                    var li = $('<li />');
                    if (i == 1)
                        li.addClass('hot');
                    li.text(i);
                    num.append(li);
                }
                //设置切换按钮样式
                if (_opts.markingType == 'number') {
                    num.addClass('number');
                } else if (_opts.markingType == 'circle') {
                    num.addClass('circle');
                }

                //设置标示按钮位置
                if (_opts.markingSite == 'center') {
                    var left = (inner.width() - num.width()) / 2;
                    num.css({ left: left });
                } else if (_opts.markingSite == 'left') {
                    num.css({
                        left: 20
                    });
                } else {
                    num.css({
                        right: 20
                    });
                }
                num.css({
                    bottom: _opts.markingMarginBottom
                });
                //绑定按钮事件
                _this.bindMarkingEvent();
            }
        },
        //获取当前项数量
        getCount: function () {
            return this.elem.find('.slider li').length;
        },



        /*****内部使用方法*****/
        //设置当前索引，并制定是否滚动图片
        setIndex: function (index) {
            var _opts = this.opts;
            var _elem = this.elem;
            if (index == -1)
                return;
            //再显示
            //如果为 gpless滚动显示多个的时候 特出处理（因为多个的时候的处理方式是剪切--追加的 方式）,需要先设置当前项
            //如果 为单项滚动方式 需要先当前项 
            if (_opts.runType == 'single' || (_opts.runType == 'gapless' && _opts.displayCount > 1)) {
                this.elem.attr('data-index', index);
            }
            this.showImg_Index();

            //2. 数字按钮变化
            if (_opts.showMarking) {
                var num = _elem.find('.num');
                num.find('li').removeClass('hot').eq(index).addClass('hot');
            }
        },
        //滑动到当前索引图片
        showImg_Index: function () {
            var _elem = this.elem;
            var _opts = this.opts;
            var index = this.getIndex();
            //1.slider 滑动
            var slider = _elem.find('.slider');
            //水平切换
            if (_opts.showType == 'horizontal') {
                if (_opts.runType == 'single') {
                    slider.stop(true, false).animate({
                        left: -index * _opts.itemWidth
                    }, _opts.showTime, 'swing');

                } else if (_opts.runType == 'gapless') {
                    this.gaplessRunShow();
                }
            } else if (_opts.showType == 'vertical') {
                //简单单向滚动
                slider.stop(true, false).animate({
                    top: -index * _opts.itemHeight
                }, _opts.showTime, 'swing');
            } else if (_opts.showType == 'opacity') {
                var currentLi = slider.find('li').eq(_this.getIndex());
                currentLi.show().stop(true, false).animate({ opacity: 1 }, _opts.showTime, function () {
                });
                var siblingsLi = currentLi.siblings();
                siblingsLi.stop(true, false).animate({ opacity: 0 }, _opts.showTime, function () {
                    siblingsLi.hide();
                });
            }
        },
        //滚动方式---初始化设置
        initGapless: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;
            var slider = this.getSlider();
            var itemList = this.getItemList();
            itemList.addClass('shotItem hideItem');
            
            //判断是否是多个 滚动
            if (_opts.displayCount > 1) {
                //当前项 设置
                var currentGroup = _this.getCurrentGroup();
                currentGroup.removeClass('hideItem');

                currentGroup.each(function (index) {
                    var thisItem = $(this);
                    thisItem.css({
                        left: _opts.itemWidth * index
                    });
                });

            } else {
                this.getCurrentItem().removeClass('hideItem');
            }
        },
        //滚动方式---无间隙滚动(‘horizontal’)---向左滑动(多个滚动)
        gaplessHorizontal_Left: function () {
            var _this = this;
            var _opts = this.opts;
            var _elem = this.elem;
            //获取下一项
            var itemList = _this.getItemList();
            var nextItem = itemList.eq(_opts.displayCount);

            var currentGroup = _this.getCurrentGroup();
            var rightBtn = _this.getRightBtn();
            rightBtn.off('click');
            //当前组 向左滑动
            currentGroup.each(function (index) {
                var thisItem = $(this);
                var nextLeft = thisItem.position().left - _opts.itemWidth;

                thisItem.stop(true, true).animate({
                    left: nextLeft
                }, _opts.showTime, 'swing', function () { });
            });
            //下一项 左向右滑动 出现
            nextItem.css({
                left: _opts.containerWidth
            }).removeClass('hideItem');
            nextItem.stop(true, true).animate({
                left: _opts.containerWidth - _opts.itemWidth
            }, _opts.showTime, 'swing', function () {
                //将当前 组的第一项 剪切到最后
                var firstItem = currentGroup.first();
                _this.getSlider().append(firstItem.clone());
                firstItem.remove();
                //重绑 按钮事件
                rightBtn.on('click', function () {
                    _this.rightRun();
                });
            });
        },
        //滚动方式---无间隙滚动(‘horizontal’)---向右滑动（多个滚动）
        gaplessHorizontal_Right: function () {
            var _this = this;
            var _opts = this.opts;
            var _elem = this.elem;
            //获取 最后一项
            var itemList = _this.getItemList();
            var aboveItem = itemList.last();;

            var currentGroup = _this.getCurrentGroup();
            //当前组 右滚动 
            var leftBtn = _this.getLeftBtn();
            leftBtn.off('click');
            // 左向右滑动
            currentGroup.each(function (index) {
                var thisItem = $(this);
                thisItem.stop(true, true).animate({
                    left: thisItem.position().left + _opts.itemWidth
                }, _opts.showTime, 'swing', function () {
                });
            });

            //上一项 右滚动
            aboveItem.css({
                left: -_opts.itemWidth
            }).removeClass('hideItem');
            aboveItem.stop(true, true).animate({
                left: 0
            }, _opts.showTime, 'swing', function () {
                //将最后 一项 剪切到开始位置
                _this.getSlider().prepend(aboveItem.clone());
                aboveItem.remove();
                //重绑事件
                leftBtn.on('click', function () {
                    _this.leftRun();
                })
            });
            
        },
        //无间隙方式----向左滚动(单项)
        gaplessLeft: function () {
            var _this = this;
            var _opts = this.opts;
            var _elem = this.elem;
            if (_this.getIndex() == _this.getDataNext()) {
                return;
            }

            //获取下一项
            var nextItem = _this.getCurrentNext();
            var currentItem= _this.getCurrentItem();
            _this.getMarkingList().eq(_this.getDataNext()).addClass('hot').siblings().removeClass('hot');
            var rightBtn = this.getRightBtn();
            rightBtn.off('click');
            //当前组 向左滑动 
            currentItem.stop(true, true).animate({
                left: -_opts.itemWidth
            }, _opts.showTime, 'swing', function () {
                currentItem.css({
                    left: 0
                }).addClass('hideItem');
            });
            //下一项 左向右滑动 出现
            nextItem.css({
                left: _opts.containerWidth
            }).removeClass('hideItem');
            nextItem.stop(true, true).animate({
                left: 0
            }, _opts.showTime, 'swing', function () {
                rightBtn.on('click', function () {
                    _this.rightRun();
                });
                //滚动结束 修改当前项
                _elem.attr('data-index', _elem.attr('data-next'));
            });
        },
        //无间隙方式----向右滚动(单项)
        gaplessRight: function () {
            var _this = this;
            var _opts = this.opts;
            var _elem = this.elem;
            //获取下一项
            var currentItem = _this.getCurrentItem();
            var aboveItem = _this.getCurrentAbove();
            if (_this.getIndex() == _this.getDataAbove()) {
                return;
            }
            _this.getMarkingList().eq(_this.getDataAbove()).addClass('hot').siblings().removeClass('hot');
            var leftBtn = this.getLeftBtn();
            leftBtn.off('click');
            //当前组 向右滑动 
            currentItem.stop(true, true).animate({
                left: _opts.itemWidth
            }, _opts.showTime, 'swing', function () {
                currentItem.css({
                    left: 0
                }).addClass('hideItem');
            });
            //上一项 向左滚动 出现
            aboveItem.css({
                left: -_opts.itemWidth
            }).removeClass('hideItem');
            aboveItem.stop(true, true).animate({
                left: 0
            }, _opts.showTime, 'swing', function () {
                leftBtn.on('click', function () {
                    _this.leftRun();
                });
                //滚动结束 修改当前项
                _elem.attr('data-index', _elem.attr('data-above'));
            });
        },
        //无间隙方式-----绑定滚动
        gaplessRunShow: function () {
            var _elem = this.elem;
            var _opts = this.opts;
            //判断滚动方向
            //判断是单个还是多个
            if (_opts.displayCount > 1) {


                if (_opts.direction == 'ltr') {
                    this.gaplessHorizontal_Right();
                }
                else if (_opts.direction == 'rtl') {
                    this.gaplessHorizontal_Left();
                }
            } else {
                
                if (_opts.direction == 'ltr') {
                    this.gaplessRight();
                }
                else if (_opts.direction == 'rtl') {
                    
                    this.gaplessLeft();
                }
            }
        },

        //获取左侧按钮
        getLeftBtn: function () {
            var _elem = this.elem;
            return _elem.find('.leftBtn');
        },
        //获取右侧按钮
        getRightBtn: function () {
            return this.elem.find('.rightBtn');
        },


        //设置当前索引，指定上一组还是下一组
        setIndexNotRun: function (index) {
            this.elem.attr('data-index', index);
        },

        //绑定按钮事件
        bindMarkingEvent: function () {
            var _this = this;
            var _opts = this.opts;
            var liList = this.elem.find('.num li');
            //判断滚动方式
            if (_opts.runType == 'gapless') {
                //鼠标经过事件
                liList.click(function () {
                    var index = liList.index($(this));
                    _this.elem.attr('data-next', index);
                    _this.gaplessLeft();
                });
            } else {
                //鼠标经过事件
                liList.hover(function () {
                    //_this.autoRunStop();
                    var index = liList.index($(this));
                    _this.setIndex(index);
                }, function () {
                   // _this.autoRunStart();
                });
            }
        },

        //右按钮 点击事件
        rightRun: function () {
            var _this = this;
            var _opts = this.opts;
            var nextIndex = this.getNextIndex();
            //判断滚动类型
            _opts.direction = 'rtl';
            this.elem.attr('data-next', nextIndex);

            this.setIndex(nextIndex);
        },
        //左按钮 点击事件
        leftRun: function () {
            var _this = this;
            var _opts = this.opts;
            var aboveIndex = this.getAboveIndex();
            //判断滚动类型
            _opts.direction = 'ltr';
            this.elem.attr('data-above', aboveIndex);
            this.setIndex(aboveIndex);
        },


        /**索引和项**/
        //获取 slider
        getSlider: function () {
            return this.elem.find('.slider');
        },
        //获取滚动 列表
        getItemList: function () {
            return this.elem.find('.slider li');
        },
        //获取 标志类表
        getMarkingList: function () {
            return this.elem.find('.num li');
        },
        //获取当前组
        getCurrentGroup: function () {
            var _elem = this.elem;
            var _opts = this.opts;
            var slider = _elem.find('.slider');

            return slider.find('li:lt(' + _opts.displayCount + ')');
        },
        //获取当前项
        getCurrentItem: function () {
            return this.getItemList().eq(this.getIndex());
        },
        //获取下一项
        getCurrentNext: function () {
            return this.getItemList().eq(this.elem.attr('data-next'));
        },
        //获取上一项
        getCurrentAbove: function () {
            return this.getItemList().eq(this.elem.attr('data-above'));
        },
        //获取上一项
        getAboveGroup: function () {
            var _elem = this.elem;
            var _opts = this.opts;
            var slider = _elem.find('.slider');
            var index = this.getAboveIndex();
            return slider.find('li').eq(index);
        },
        //获取下一项
        getNextGroup: function () {
            var _elem = this.elem;
            var _opts = this.opts;
            var slider = _elem.find('.slider');
            var index = this.getNextIndex();
            return slider.find('li').eq(index);
        },
        //获取当前活动项 索引
        getIndex: function () {
            return parseInt(this.elem.attr('data-index'));
        },
        //获取下一项索引
        getDataNext: function () {
            var next = this.elem.attr('data-next');
            return parseInt(next);
        },
        //获取上一项 索引
        getDataAbove: function () {
            var above = this.elem.attr('data-above');
            return parseInt(above);
        },
        //获取上一项 索引
        getAboveIndex: function () {
            var _opts = this.opts;
            var index = this.getIndex();
            var pageCount = this.getCount();
            index--;
            if (index < 0) {
                if (_opts.loopRun) {
                    index = pageCount - 1;
                } else {
                    //禁止 循环滚动
                    return -1;
                }
            }
            return index;
        },
        //获取下一项 索引
        getNextIndex: function () {
            var _opts = this.opts;
            var index = this.getIndex();
            var pageCount = this.getCount();
            index++;
            if (index >= pageCount) {
                if (_opts.loopRun) {
                    index = 0;
                } else {
                    //禁止循环滚动
                    return -1;
                }
            }
            return index;
        },

        /********定时器方法*********/
        //停止自动滚动
        autoRunStop: function () {
            if (this.timer)
                clearInterval(this.timer);
        },
        //启动自动滚动
        autoRunStart: function () {
            var _opts = this.opts;
            var _this = this;
            if (_opts.autoRun) {
                _this.timer = setInterval(function () {
                    _this.rightRun();
                }, _opts.autoRunTime);
            }
        }
    }

    //注册成 jquery插件,返回控件对象
    $.fn.sliderBar = function (options) {
        var bar = new SliderBar(this, options);
        bar.init();
        return bar;
    }
})(jQuery);