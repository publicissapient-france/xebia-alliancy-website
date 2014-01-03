(function () {

    //Ci dessous, le lodash du pauvre, les API sont compatibles, mais ca servait à rien de télécharger
    // tout lodash pour 2 fonctions
    var _ = {
        findIndex: function (coll, fn) {
            for (var index in coll) {
                if (fn(coll[index])) {
                    return index << 0;
                }
            }

            return -1;
        },
        find: function (coll, fn) {
            for (var index in coll) {
                var element = coll[index];
                if (fn(element)) {
                    return element;
                }
            }

            return null;
        }
    };

    var PAGE = {
        PAGES: [
            {page: 'xebia', title: "Xebia", url: 'index.html', mainUrl: 'http://www.xebia.fr', urlDetail: 'xebia-detail.html'},
            {page: 'ux', title: "UX Republic", url: 'ux.html', mainUrl: 'http://ux-republic.com', urlDetail: 'ux-detail.html'},
            {page: 'labs', title: "Xebia Labs", url: 'labs.html', mainUrl: 'http://www.xebialabs.com', urlDetail: 'labs-detail.html'},
            {page: 'thiga', title: "THIGA", url: 'thiga.html', mainUrl: 'http://www.thiga.fr', urlDetail: 'thiga-detail.html'}
        ],
        currentPage: null,
        isCurrentDetail: null,
        findIndex: function (searchedPage) {
            return _.findIndex(this.PAGES, function (page) {
                return searchedPage.page == page.page
            });
        },
        findByName: function (pageName) {
            return  _.find(this.PAGES, function (page) {
                return page.page == pageName
            });
        },
        findNext: function () {
            var currentIndex = this.findIndex(this.currentPage);

            var nextPageIndex = (currentIndex >= this.totalPages() - 1) ? 0 : currentIndex + 1;
            return this.findByIndex(nextPageIndex);
        },
        findPrev: function () {
            var currentIndex = this.findIndex(this.currentPage);

            var prevPageIndex = (currentIndex < 1) ? this.totalPages() - 1 : currentIndex - 1;
            return this.findByIndex(prevPageIndex);
        },
        findByIndex: function (idx) {
            return this.PAGES[idx];
        },
        totalPages: function () {
            return this.PAGES.length;
        },
        isCurrentPage: function (page) {
            return this.currentPage.page == page.page;
        }
    };

    var formatDateIso = function (date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDay();

        return '' + year + '-' + month + '-' + day;
    };

    var MONTH_SHORT = {
        '1': 'Jan',
        '2': 'Feb',
        '3': 'Mar',
        '4': 'Apr',
        '5': 'May',
        '6': 'Jun',
        '7': 'Jul',
        '8': 'Aug',
        '9': 'Sep',
        '10': 'Oct',
        '11': 'Nov',
        '12': 'Dec'
    };

    var formatDateTitle = function (date) {
        var year = date.getFullYear();
        var monthNum = date.getMonth() + 1;
        var month = MONTH_SHORT['' + monthNum];
        var day = date.getDate();

        return '' + day + ' ' + month + ' ' + year;
    };

    var parseExternalDate = function (eventBriteDate) {
        var year = parseInt(eventBriteDate.substr(0, 4), 10);
        var month = parseInt(eventBriteDate.substr(5, 2), 10) - 1;
        var day = parseInt(eventBriteDate.substr(8, 2), 10);

        var hour = parseInt(eventBriteDate.substr(11, 2), 10);
        var minute = parseInt(eventBriteDate.substr(14, 2), 10);
        var second = parseInt(eventBriteDate.substr(17, 2), 10);

        return new Date(year, month, day, hour, minute, second);
    };

    var BLOCK = {
        TEMPLATE_BLOCK: '<section class="block standard-block"><div class="title-block"><time></time></div><div class="content-block"><h1></h1></div></section>',
        initXebiaTemplateBlock: function (blockClass, date, title, url) {
            var $block = $(this.TEMPLATE_BLOCK);
            $block.addClass(blockClass).addClass('xebia');
            var $titleBlock = $block.find('.title-block');
            $titleBlock.addClass('xebia-title').prepend('Xebia');
            $titleBlock.find('time').attr('datetime', formatDateIso(date)).text(formatDateTitle(date));
            $block.find('h1').html('<a href="' + url + '">' + title + '</a>');

            return $block;
        }
    };

    var Mixitup = function () {
        this.currentFilter = 'block';
        this.$blockContent = $('#blockContent');
        this.$blockContent.mixitup({
            targetSelector: '.block',
            showOnLoad: 'none'
        });
        this.$blockContent.sortable();
    };

    Mixitup.prototype.sort = function (sort) {
        this.$blockContent.mixitup('sort', sort)
    };

    Mixitup.prototype.filter = function (filter) {
        if (!filter) {
            filter = 'block';
        }

        this.currentFilter = filter;
        this.$blockContent.mixitup('filter', filter);
    };

    Mixitup.prototype.remix = function () {
        this.$blockContent.mixitup('remix', this.currentFilter);
    };

    Mixitup.prototype.randomize = function () {
        this.sort('random');
    };

    window.APPLICATION = {

        navigationIntervalIndex: null,

        mixitup: null,
        init: function (currentWrapperClass) {
            var currentPageName = currentWrapperClass.replace(' detail', '');
            PAGE.currentPage = PAGE.findByName(currentPageName);
            PAGE.isCurrentDetail = (currentWrapperClass.indexOf('detail') >= 0);

            this.initRouting();
            this.initNavigation();
            this.initBlocks();
            this.initStickyHeader();
            this.initMenuMobile();
            this.initSubLevel();
            this.loadSubpage();
            this.initClickAllianceLogo();
        },
        loadSubpage: function () {
            if (PAGE.isCurrentDetail) {
                this.goToSubPage(PAGE.currentPage);
            }
        },
        initMenuMobile: function () {
            $('.stripes').click(function () {
                $(this).toggleClass('on');
                $('.frise').toggleClass('open');
            });
        },
        initSubLevel: function () {
            var self = this;

            $('.frise a').removeAttr('href').click(function () {
                var classToSearch = $(this).attr('class');

                var subpage = PAGE.findByName(classToSearch);
                if (PAGE.isCurrentPage(subpage) && PAGE.isCurrentDetail) {
                    self.mixitup.randomize();
                } else {
                    self.subNavigate(subpage)
                }
            });
        },
        initStickyHeader: function () {
            var $window = $(window);
            var $header = $('header');
            var headerBottomPosition = $header.position().top + $header.height();
            var $frise = $('.frise');
            var stickyThreshold = headerBottomPosition - $frise.height();
            $window.scroll(function () {
                if ($window.scrollTop() > stickyThreshold) {
                    $frise.css({
                        position: 'fixed',
                        top: 0,
                        bottom: 'inherit'
                    });
                } else {
                    $frise.attr('style', '');
                }
            });
        },
        initRouting: function () {
            var self = this;
            window.onpopstate = function (event) {
                var state = event.state;

                if (state) {
                    var page = state.page;

                    if (state.mode == 'detail') {
                        self.goToSubPage(page)
                    } else {
                        self.goToPage(page);
                    }
                }
            }
        },
        initBlocks: function () {

            this.initEventbriteBlock();
            this.initBlogBlock();

            this.mixitup = new Mixitup();
        },
        displayBlogPost: function (post) {
            var date = parseExternalDate(post.date);
            var title = post.title;
            var excerpt = post.content;
            var url = post.url;


            var $blogBlock = BLOCK.initXebiaTemplateBlock('blog-block', date, title, url);

            var $contentBlock = $blogBlock.find('.content-block');
            var $excerpt = $('<div class="excerpt"><div class="excerpt-content">' + excerpt + '</div></div>');
            $excerpt.find('.more-link').remove();


            $excerpt.find('img').css('width', 'inherit').css('height', 'inherit');
            $contentBlock.append($excerpt);

            this.addAndDisplayXebiaBlock($blogBlock);
        },
        initBlogBlock: function () {
            var self = this;
            var urlApiBlog = 'http://blog.xebia.fr/wp-json-api/get_recent_posts/?count=1';
            var promiseForBlog = $.ajax(urlApiBlog, {
                dataType: 'jsonp'
            });


            promiseForBlog.done(function (blogResponse) {
                var posts = blogResponse.posts;
                if (posts.length < 1) {
                    return;
                }

                posts.forEach(function (post) {
                    self.displayBlogPost(post)
                });

            });
        },
        initEventbriteBlock: function () {
            var self = this;
            Eventbrite({'app_key': 'UW2IBMBZKW4U6EPHQK'}, function (ebClient) {
                //http://developer.eventbrite.com/doc/organizers/organizer_list_events/
                ebClient.organizer_list_events({id: 1627902102, only_display: 'url, status, start_date, title, logo'}, function (response) {
                    if (response.events && response.events.length > 0) {
                        var now = new Date().getTime();
                        var nextEvent = _.find(response.events, function (eventWrapper) {
                            var event = eventWrapper.event;
                            var startDate = parseExternalDate(event.start_date);
                            return startDate.getTime() > now && event.status == 'Live';
                        });

                        if (nextEvent) {
                            var event = nextEvent.event;
                            if (event.title) {
                                self.updateEventbriteBlock('Xebia', parseExternalDate(event.start_date), event.title, event.url, event.logo, 'logo ' + event.title);
                            }
                        }
                    }
                });
            });
        },
        initClickAllianceLogo: function () {
            var self = this;
            $('.alliance-logo').click(function () {
                if (PAGE.isCurrentDetail) {
                    self.navigate(PAGE.currentPage);
                    //Reset filter
                    self.mixitup.filter();
                } else {
                    self.mixitup.randomize();
                }
            });
        },
        initNavigation: function () {
            var self = this;

            //bug qui fait que l'animation ne se déclenche pas
            var $headers = $('.headers');

            var leftPercentPosition = ($headers.css('left').replace('px', '') << 0) * 100 / $headers.width();
            $headers.css('left', leftPercentPosition + '%');
            $headers.find('> div').css('display', 'block');

            $('.next-page').click(function () {
                self.goToNextPage();
            });
            $('.prev-page').click(function () {
                self.goToPrevPage();
            });

            $('.page-indicators > span').click(function () {
                var pageIndexToGo = $('.page-indicators > span').index(this);
                var pageToGo = PAGE.findByIndex(pageIndexToGo);

                self.navigate(pageToGo);
            });

            this.initNavigationInterval();
        },
        goToNextPage: function () {
            var nextPage = PAGE.findNext();

            this.navigate(nextPage);
        },
        goToPrevPage: function () {
            var prevPage = PAGE.findPrev();

            this.navigate(prevPage);
        },
        initNavigationInterval: function () {
            clearInterval(this.navigationIntervalIndex);
            var self = this;
            this.navigationIntervalIndex = setInterval(function () {
                self.goToNextPage();
            }, 10000);
        },
        instrumentKnowingMore: function (pageToGo) {
            $('.knowing-more a').attr('href', pageToGo.mainUrl).attr('title', pageToGo.title);
        },
        goToPage: function (pageToGo) {

            var indexOfPage = PAGE.findIndex(pageToGo);

            $('.wrapper').attr('class', 'wrapper ' + pageToGo.page);
            PAGE.isCurrentDetail = false;
            this.mixitup.filter();


            this.instrumentKnowingMore(pageToGo);
            $('.headers').animate({
                left: (-indexOfPage * 100) + '%'
            }, 500, function () {
                PAGE.currentPage = pageToGo;
            });

            this.initNavigationInterval();
        },
        goToSubPage: function (subPageToGo) {

            //Fixing du header
            this.instrumentKnowingMore(subPageToGo);
            clearInterval(this.navigationIntervalIndex);

            $('.wrapper').attr('class', 'wrapper ' + subPageToGo.page + ' detail');
            PAGE.currentPage = subPageToGo;
            PAGE.isCurrentDetail = true;

            this.mixitup.filter(subPageToGo.page);
        },
        navigate: function (page) {
            this.goToPage(page);
            history.pushState({page: page, mode: 'normal'}, page.title, page.url)
        },
        subNavigate: function (subpage) {
            this.goToSubPage(subpage);
            history.pushState({page: subpage, mode: 'detail'}, subpage.title, subpage.urlDetail)
        },
        addAndDisplayXebiaBlock: function ($block) {
            var $blockContent = $('#blockContent');
            $blockContent.append($block);
            $block.css('display', 'inline-block');

            $block.animate({
                opacity: 1
            });

            this.mixitup.remix();
        },
        updateEventbriteBlock: function (entity, date, title, url, img, altImg) {
            var $eventBriteBlock = BLOCK.initXebiaTemplateBlock('eventbrite-block', date, title, url);

            var $contentBlock = $eventBriteBlock.find('.content-block');
            $contentBlock.append('<div class="bottom-arrow"></div>');
            $contentBlock.append('<img src="' + img + '" alt="' + altImg + '" class="illustration big-illustration"/>');

            this.addAndDisplayXebiaBlock($eventBriteBlock);
        }
    };
})();

