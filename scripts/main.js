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

    var PAGES = [
        {page: 'xebia', title: "Xebia", url: 'index.html', mainUrl: 'http://www.xebia.fr'},
        {page: 'ux', title: "UX Republic", url: 'ux.html', mainUrl: 'http://ux-republic.com'},
        {page: 'labs', title: "Xebia Labs", url: 'labs.html', mainUrl: 'http://www.xebialabs.com'},
        {page: 'thiga', title: "THIGA", url: 'thiga.html', mainUrl: 'http://www.thiga.fr'}
    ];

    var findPageIndex = function (currentPage) {
        return _.findIndex(PAGES, function (page) {
            return page.page == currentPage;
        });
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


    var templaceBlock = '<section class="block standard-block "><div class="title-block xebia-title">Xebia<time></time></div><div class="content-block"><h1></h1></div></section>';

    var initTemplateBlock = function (blockClass, date, title, url) {
        var $block = $(templaceBlock);
        $block.addClass(blockClass);
        $block.find('.title-block time').attr('datetime', formatDateIso(date)).text(formatDateTitle(date));
        $block.find('h1').html('<a href="' + url + '">' + title + '</a>');

        return $block;
    };

    var addAndDisplayBlock = function ($block) {
        $('#blockContent').append($block);
        $block.css('display', 'inline-block');
        $block.animate({
            opacity: 1
        });
    };

    var updateEventbriteBlock = function (entity, date, title, url, img, altImg) {
        var $eventBriteBlock = initTemplateBlock('eventbrite-block', date, title, url);

        var $contentBlock = $eventBriteBlock.find('.content-block');
        $contentBlock.append('<div class="bottom-arrow"></div>');
        $contentBlock.append('<img src="' + img + '" alt="' + altImg + '" class="illustration big-illustration"/>');

        //addAndDisplayBlock($eventBriteBlock);
    };

    window.APPLICATION = {
        currentPage: null,
        navigationIntervalIndex: null,
        init: function (currentPage) {
            this.currentPage = currentPage;
            this.initRouting();
            this.initNavigation();
            this.initBlocks();
            this.initStickyHeader();
            this.initMenuMobile();

        },
        initMenuMobile: function () {
            $('.stripes').click(function () {
                $(this).toggleClass('on');
                $('.frise').toggleClass('open');
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
                var page = event.state;
                if (page) {
                    self.goToPage(page);
                }
            }
        },
        initBlocks: function () {

            this.initEventbriteBlock();
            this.initBlogBlock();

            var $blockContent = $('#blockContent');
            $blockContent.mixitup({
                targetSelector: '.block'
            });
            $blockContent.sortable();
        },
        displayBlogPost: function (post) {
            var date = parseExternalDate(post.date);
            var title = post.title;
            var excerpt = post.content;
            var url = post.url;

            var $blogBlock = initTemplateBlock('blog-block', date, title, url);

            var $contentBlock = $blogBlock.find('.content-block');
            var $excerpt = $('<div class="excerpt"><div class="excerpt-content">' + excerpt + '</div></div>');
            $excerpt.find('.more-link').remove();

            $excerpt.find('img').css('width', 'inherit').css('height', 'inherit');
            $contentBlock.append($excerpt);

//TODO a reactiver
            //addAndDisplayBlock($blogBlock);
        },
        initBlogBlock: function () {
            var urlApiBlog = 'http://blog.xebia.fr/wp-json-api/get_recent_posts/?count=1';
            var promiseForBlog = $.ajax(urlApiBlog, {
                dataType: 'jsonp'
            });

            var self = this;
            promiseForBlog.done(function (blogResponse) {
                var posts = blogResponse.posts;
                if (posts.length < 1) {
                    return;
                }
                posts.forEach(self.displayBlogPost);
            });
        },
        initEventbriteBlock: function () {

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
                                updateEventbriteBlock('Xebia', parseExternalDate(event.start_date), event.title, event.url, event.logo, 'logo ' + event.title);
                            }
                        }
                    }
                });
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
                var nextPageIndex = $('.page-indicators > span').index(this);
                var nextPage = PAGES[nextPageIndex];

                self.navigate(nextPage);
            });

            this.initNavigationInterval();
        },
        goToNextPage: function () {
            var currentIndex = findPageIndex(this.currentPage);

            var nextPageIndex = (currentIndex >= PAGES.length - 1) ? 0 : currentIndex + 1;
            var nextPage = PAGES[nextPageIndex];

            this.navigate(nextPage);
        },
        goToPrevPage: function () {
            var currentIndex = findPageIndex(this.currentPage);

            var prevPageIndex = (currentIndex < 1) ? PAGES.length - 1 : currentIndex - 1;
            var prevPage = PAGES[prevPageIndex];

            this.navigate(prevPage);
        },
        initNavigationInterval: function () {
            clearInterval(this.navigationIntervalIndex);
            var self = this;
            this.navigationIntervalIndex = setInterval(function () {
                self.goToNextPage();
            }, 10000);
        },
        goToPage: function (pageToGo) {
            var self = this;
            var indexOfPage = findPageIndex(pageToGo.page);

            $('.wrapper').attr('class', 'wrapper ' + pageToGo.page);
            $('.knowing-more a').attr('href', pageToGo.mainUrl).attr('title', pageToGo.title);

            $('.headers').animate({
                left: (-indexOfPage * 100) + '%'
            }, 500, function () {
                self.currentPage = pageToGo.page;
            });
            this.initNavigationInterval();
        },
        navigate: function (page) {
            this.goToPage(page);
            document.title = page.title;
            history.pushState(page, page.title, page.url)
        }
    };
})();

