(function () {

    var PAGES = [
        {page: 'xebia', title: "Xebia", url: 'index.html'},
        {page: 'ux', title: "UX Republic", url: 'ux.html'},
        {page: 'labs', title: "Xebia Labs", url: 'labs.html'},
        {page: 'thiga', title: "THIGA", url: 'thiga.html'}
    ];


    window.APPLICATION = {
        currentPage: null,
        init: function (currentPage) {
            this.currentPage = currentPage;
            this.initRouting();
            this.initNavigation();
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
        initNavigation: function () {
            var self = this;

            //bug qui fait que l'animation ne se déclenche pas
            var $headers = $('.headers');
            $headers.css('left', $headers.css('left'));

            var goToNextPage = function () {
                var currentIndex = _.findIndex(PAGES, function (page) {
                    return page.page == self.currentPage
                });

                var nextPageIndex = (currentIndex >= PAGES.length - 1) ? 0 : currentIndex + 1;
                var nextPage = PAGES[nextPageIndex];

                self.navigate(nextPage);
            };

            $('.next-page').click(goToNextPage);

            $('.prev-page').click(function () {
                var currentIndex = _.findIndex(PAGES, function (page) {
                    return page.page == self.currentPage
                });

                var nextPageIndex = (currentIndex < 1) ? PAGES.length - 1 : currentIndex - 1;
                var nextPage = PAGES[nextPageIndex];

                self.navigate(nextPage);
            });

            setInterval(function () {
         //       goToNextPage();
            }, 10000);
        },
        goToPage: function (pageToGo) {
            var self = this;
            var indexOfPage = _.findIndex(PAGES, function (page) {
                return page.page == pageToGo.page;
            });

            $('.wrapper').attr('class', 'wrapper ' + pageToGo.page);

            $('.headers').animate({
                left: (-indexOfPage * 1024) + 'px'
            }, 500, function () {
                self.currentPage = pageToGo.page;
            });
        },
        navigate: function (page) {
            this.goToPage(page);
            history.pushState(page, page.title, page.url)
        }
    };
})();

