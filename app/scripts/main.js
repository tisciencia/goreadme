$('.dropdown-toggle').dropdown();

//var goReadMeAppModule = angular.module('goReadMeApp', ['ui.sortable']);

goreadmeApp.filter('encodeURI', function() {
    return encodeURIComponent;
});

goreadmeApp.filter('momentDate', function() {
    return function(date) {
        return moment(date).fromNow();
    };
});

goreadmeApp.controller('goReadMeCtrl', function($scope, $http, $timeout, $window) {

    $scope.accessToken = '';
    $scope.admin = false;
    $scope.loading = 0;
    $scope.contents = {};
    $scope.opts = {
        folderClose: {},
        nav: true,
        expanded: false,
        mode: 'unread',
        sort: 'newest',
        hideEmpty: false
    };

    $scope.sortableoptions = {
        stop: function() {
            $scope.uploadOpml();
        }
    };

    $scope.importOpml = function() {
        $scope.shown = 'feeds';
        $scope.loading++;
        $('#import-opml-form').ajaxForm(function() {
            $('#import-opml-form')[0].reset();
            $scope.loaded();
            $scope.showMessage('OPML import is happening. It can take a minute. Don\'t reorganize your feeds until it\'s completed importing. Refresh to see its progress.');
        });
    };

    $scope.loaded = function() {
        $scope.loading--;
    };

    $scope.http = function(method, url, data) {
        return $http({
            method: method,
            url: url,
            data: $.param(data || ''),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    };

    $scope.addSubscription = function() {
        if (!$scope.addFeedUrl) {
            return false;
        }
        $scope.loading++;
        var f = $('#add-subscription-form');
        $scope.http('POST', f.attr('data-url'), {
            url: $scope.addFeedUrl
        }).then(function() {
                $scope.addFeedUrl = '';
                // I think this is needed due to the datastore's eventual consistency.
                // Without the delay we only get the feed data with no story data.
                $timeout(function() {
                    $scope.refresh($scope.loaded);
                }, 250);
            }, function(data) {
                if (data.data) {
                    console.log(data.data);
                    toastr.error(data.data, 'Oops!');
                }
                $scope.loading--;
            });
    };

    $scope.procStory = function(xmlurl, story) {
        story.feed = $scope.xmlurls[xmlurl];
        story.guid = xmlurl + '|' + story._id;
        if (!story.title) {
            story.title = '(title unknown)';
        }
    };

    $scope.refresh = function(cb) {
        $scope.loading++;
        $scope.shown = 'feeds';
        delete $scope.currentStory;
        $http.get($('#refresh').attr('data-url-feeds'))
            .success(function(data) {
                var unreadStories = data.unreadStories || [],
                    currentStory,
                    i, l;
                $scope.feeds = data.subscriptions || [];
                if($scope.feeds.length > 0) {
                    $scope.feeds = _.sortBy($scope.feeds, function(s) { return s.title; });
                }
                $scope.numfeeds = 0;
                $scope.stories = [];
                $scope.favorites = [];
                $scope.unreadStories = {};
                $scope.last = 0;
                $scope.xmlurls = {};
                $scope.icons = data.icons;
                $scope.opts = data.options ? JSON.parse(data.options) : $scope.opts;

                var loadStories = function(feed) {
                    $scope.numfeeds++;
                    $scope.xmlurls[feed.xmlurl] = feed;
                    var stories = feed.items || [];
//          for(var i = 0; i < stories.length; i++) {
//            $scope.procStory(feed.xmlurl, stories[i]);
//            if ($scope.last < stories[i].Date) {
//              $scope.last = stories[i].Date;
//            }
//            $scope.stories.push(stories[i]);
//            if(stories[i].starred) $scope.favorites.push(stories[i]);
//            $scope.unreadStories[stories[i].guid] = !stories[i].read;
//          }
                };

                for(i = 0; i < $scope.feeds.length; i++) {
                    var f = $scope.feeds[i];

                    if (f.xmlurl) {
                        loadStories(f);
                    } else if (f.outline) {  // check for empty groups
                        for(var j = 0; j < f.outline.length; j++) {
                            loadStories(f.outline[j]);
                            $scope.xmlurls[f.outline[j].xmlurl].folder = f.title;
                        }
                    }
                }

                for(i = 0, l = unreadStories.length; i < l; i ++) {
                    currentStory = unreadStories[i];
                    currentStory.feed = $scope.xmlurls[currentStory.xmlurl];
                    currentStory.guid = currentStory.xmlurl + '|' + currentStory._id;

                    $scope.stories.push(currentStory);
                    if(currentStory.starred) {
                        $scope.favorites.push(currentStory);
                    }
                    $scope.unreadStories[currentStory.guid] = !currentStory.read;
                }

                if (typeof cb === 'function') {
                    cb();
                }
                $scope.loaded();
                $scope.updateUnread();
                $scope.updateStories();
                $scope.updateTitle();
                setTimeout($scope.applyGetFeed);
            })
            .error(function() {
                if (typeof cb === 'function') {
                    cb();
                }
                $scope.loaded();
            });
    };

    $scope.updateTitle = function() {
        var ur = $scope.unread.all || 0;
        document.title = 'go-read me' + (ur !== 0 ? ' (' + ur + ')' : '');
    };

    $scope.setCurrent = function(i, noClose, isClick) {
        if (!noClose && i === $scope.currentStory) {
            delete $scope.currentStory;
            return;
        }
        var story = $scope.dispStories[i];
        $scope.getContents(story, function() {
            if ($scope.currentStory !== i) {
                setTimeout(function() {
                    var se = $('#storydiv' + i),
                        eTop = se.offset().top;
                    if (!isClick || eTop < 0 || eTop > $('#story-list').height()) {
                        se[0].scrollIntoView();
                    }
                });
            }
            $scope.currentStory = i;
            $scope.markAllRead(story);
        });
        // if (i > 0) {
        //     $scope.getContents($scope.dispStories[i - 1]);
        // }
        // if (i < $scope.dispStories.length - 2) {
        //     $scope.getContents($scope.dispStories[i + 1]);
        // }
    };

    $scope.prev = function() {
        if ($scope.currentStory > 0) {
            $scope.setCurrent($scope.currentStory - 1);
        }
    };

    $scope.toggleHideEmpty = function() {
        $scope.opts.hideEmpty = !$scope.opts.hideEmpty;
        $scope.saveOpts();
    };

    $scope.shouldHideEmpty = function(f) {
        if (!$scope.opts.hideEmpty) {
            return false;
        }
        var cnt = f.outline ? $scope.unread.folders[f.title] : $scope.unread.feeds[f.xmlurl];
        return cnt === 0;
    };

    $scope.next = function() {
        if ($scope.dispStories && typeof $scope.currentStory === 'undefined') {
            $scope.setCurrent(0);
        } else if ($scope.dispStories && $scope.currentStory < $scope.dispStories.length - 1) {
            $scope.setCurrent($scope.currentStory + 1);
        }
    };

    $scope.updateUnread = function() {
        var i, f, j, s, folder;
        $scope.unread = {
            'all': 0,
            'feeds': {},
            'folders': {}
        };

        for (i = 0; i < $scope.feeds.length; i++) {
            f = $scope.feeds[i];
            if (f.outline) {
                $scope.unread.folders[f.title] = 0;
                for (j = 0; j < f.outline.length; j++) {
                    $scope.unread.feeds[f.outline[j].xmlurl] = 0;
                }
            } else {
                $scope.unread.feeds[f.xmlurl] = 0;
            }
        }

        for (i = 0; i < $scope.stories.length; i++) {
            s = $scope.stories[i];
            if ($scope.unreadStories[s.guid]) {
                $scope.unread.all++;
                $scope.unread.feeds[s.feed.xmlurl]++;
                folder = $scope.xmlurls[s.feed.xmlurl].folder;
                if (folder) {
                    $scope.unread.folders[folder]++;
                }
            }
        }
        $scope.updateUnreadCurrent();
    };

    $scope.updateUnreadCurrent = function() {
        if ($scope.activeFeed) {
            $scope.unread.current = $scope.unread.feeds[$scope.activeFeed];
        }
        else if ($scope.activeFolder) {
            $scope.unread.current = $scope.unread.folders[$scope.activeFolder];
        }
        else {
            $scope.unread.current = $scope.unread.all;
        }
    };

    $scope.markAllRead = function(story) {
        if (!$scope.dispStories.length) {
            return;
        }
        var ss = [], i;
        var checkStories = story ? [story] : $scope.dispStories;
        for (i = 0; i < checkStories.length; i++) {
            var s = checkStories[i];
            if (!s.read) {
                if ($scope.opts.mode === 'unread') {
                    s.remove = true;
                }
                s.read = true;
                ss.push({
                    Feed: s.feed.xmlurl,
                    Story: s._id
                });
                delete $scope.unreadStories[s.guid];
            }
        }
        $scope.http('POST', $('#mark-all-read').attr('data-url-read'), {
            stories: JSON.stringify(ss)
        });
        var unread = false;
        for (i = $scope.stories.length - 1; i >= 0; i--) {
            if (!story && $scope.stories[i].remove) {
                $scope.stories.splice(i, 1);
            } else if (!$scope.stories[i].read) {
                unread = true;
            }
        }

        $scope.updateUnread();
        //$scope.updateStories();
        $scope.updateTitle();

        if (!unread) {
            $scope.http('POST', $('#mark-all-read').attr('data-url'), { last: $scope.last });
        }
    };

    $scope.active = function() {
        if ($scope.activeFolder) {
            return $scope.activeFolder;
        }
        if ($scope.activeFeed) {
            return $scope.xmlurls[$scope.activeFeed].title;
        }
        return 'all items';
    };

    $scope.nothing = function() {
        return $scope.loading === 0 && $scope.stories && !$scope.numfeeds && $scope.shown !== 'about';
    };

    $scope.toggleNav = function() {
        $scope.opts.nav = !$scope.opts.nav;
        $scope.saveOpts();
    };

    $scope.toggleExpanded = function() {
        $scope.opts.expanded = !$scope.opts.expanded;
        $scope.saveOpts();
        $scope.applyGetFeed();
    };

    $scope.setExpanded = function(v) {
        $scope.opts.expanded = v;
        $scope.saveOpts();
        $scope.applyGetFeed();
    };

    $scope.navspan = function() {
        return $scope.opts.nav ? '' : 'no-nav';
    };

    $scope.navmargin = function() {
        return $scope.opts.nav ? {} : {'margin-left': '0'};
    };

    $scope.saveOpts = function() {
        $scope.http('POST', $('#story-list').attr('data-url-options'), {
            options: JSON.stringify($scope.opts)
        });
    };

    $scope.overContents = function(s) {
        if (typeof $scope.contents[s.guid] !== 'undefined') {
            return;
        }
        s.getTimeout = $timeout(function() {
            //$scope.getContents(s);
        }, 250);
    };
    $scope.leaveContents = function(s) {
        if (s.getTimeout) {
            $timeout.cancel(s.getTimeout);
        }
    };

    $scope.getContents = function(story, cb) {
        if (typeof $scope.contents[story.guid] !== 'undefined') {
            cb();
        }
        // for the moment when I'm downloading all contents at startup
        if (story.content && typeof(story.content) === 'string') {
            $scope.contents[story.guid] = story.content;
            return;
        }
        
        $scope.fetchContents(story, cb);
    };

    $scope.fetchContents = function(story, cb) {
        delete $scope.fetchPromise;
        if (!story) {
            return;
        }
        var storyToFetch = {feed: story.feed.xmlurl, story: story._id};
        $http.post($('#mark-all-read').attr('data-url-contents'), storyToFetch)
            .success(function(data) {
                story.content = data.content;
                $scope.contents[story.guid] = data.content;
                if(typeof(cb) === 'function') {
                    cb();
                }
            }).error(function(data, status, headers, config) {
                console.log(data);
                console.log(status);
            });
    };

    $scope.setActiveFeed = function(feed) {
        delete $scope.activeFolder;
        if(feed) {
            $scope.activeFeed = feed.xmlurl;
        } else {
            $scope.activeFeed = feed;
        }
        delete $scope.currentStory;

        if(feed && !feed.refreshed) {
            $http.get('/item/get-contents/' + encodeURIComponent(feed.xmlurl)).success(function(data) {
                var story;
                feed.refreshed = true;

                for(var i = 0, l = data.length; i < l; i ++) {
                    story = data[i];
                    story.feed = $scope.xmlurls[feed.xmlurl];
                    story.guid = feed.xmlurl + '|' + story._id;

                    var existStory = _.find($scope.stories, function(s) { return s._id === story._id; });
                    if(!existStory) {
                        $scope.stories.push(story);
                    }
                }
                $scope.updateStories();
                $scope.applyGetFeed();
                $scope.updateUnreadCurrent();
            });
        } else {
            $scope.updateStories();
            $scope.applyGetFeed();
            $scope.updateUnreadCurrent();
        }
    };

    $scope.setActiveFolder = function(folder) {
        delete $scope.activeFeed;
        $scope.activeFolder = folder;
        delete $scope.currentStory;
        $scope.updateStories();
        $scope.applyGetFeed();
        $scope.updateUnreadCurrent();
    };

    $scope.setMode = function(mode) {
        $scope.opts.mode = mode;
        $scope.updateStories();
        $scope.applyGetFeed();
        $scope.saveOpts();
    };

    $scope.setSort = function(order) {
        $scope.opts.sort = order;
        $scope.updateStories();
        $scope.saveOpts();
    };

    $scope.updateStories = function() {
        var stories = $scope.stories,
            i, s;
        $scope.dispStories = [];
        if ($scope.activeFolder) {
            if($scope.activeFolder === 'favorites') {
                $scope.dispStories = $scope.favorites;
                return;
            }
            for (i = 0; i < stories.length; i++) {
                s = stories[i];
                if ($scope.xmlurls[s.feed.xmlurl].folder === $scope.activeFolder) {
                    $scope.dispStories.push(s);
                }
            }
        } else if ($scope.activeFeed) {
            if ($scope.opts.mode !== 'unread') {
                angular.forEach($scope.readStories[$scope.activeFeed], function(s) {
                    if ($scope.unreadStories[s.guid]) {
                        s.read = false;
                    }
                    $scope.dispStories.push(s);
                });
            } else {
                for (i = 0; i < stories.length; i++) {
                    s = $scope.stories[i];
                    if (s.feed.xmlurl === $scope.activeFeed) {
                        $scope.dispStories.push(s);
                    }
                }
            }
        } else {
            for (i = 0; i < stories.length; i++) {
                if(!stories[i].read) {
                    $scope.dispStories.push(stories[i]);
                }
            }
        }

        if($scope.opts.sort === 'oldest'){
            $scope.dispStories = _.sortBy($scope.dispStories, function(s) {return s.publishedDate;});
        } else {
            $scope.dispStories.sort(function(a, b){
                return a.publishedDate < b.publishedDate;
            });
        }
    };

    $scope.rename = function(feed) {
        var name = prompt('Rename to');
        if (!name) {
            return;
        }
        $http.post('/subscriptions/rename', {xmlurl: feed, title: name})
            .success(function() {
                $scope.xmlurls[feed].title = name;
            });
    };

    $scope.renameFolder = function(folder) {
        var name = prompt('Rename to', folder);
        if (!name) {
            return;
        }

        $http.post('/folders/rename', { folderName: folder, newFolderName: name })
            .success(function() {
                for (var i = 0; i < $scope.feeds.length; i++) {
                    var f = $scope.feeds[i];
                    if (f.outline && f.title === folder) {
                        f.title = name;
                        $scope.activeFolder = name;
                        break;
                    }
                }
            });
    };

    $scope.deleteFolder = function(folder) {
        if (!confirm('Delete ' + folder + ' and unsubscribe from all feeds in it?')) {
            return;
        }
        for (var i = 0; i < $scope.feeds.length; i++) {
            var f = $scope.feeds[i];
            if (f.outline && f.title === folder) {
                $scope.feeds.splice(i, 1);
                break;
            }
        }
        $scope.setActiveFeed();
    };

    $scope.unsubscribe = function(feed) {
        if (!confirm('Unsubscribe from ' + $scope.xmlurls[feed].title + '?')) {
            return;
        }
        for (var i = 0; i < $scope.feeds.length; i++) {
            var f = $scope.feeds[i];
            if (f.outline) {
                for (var j = 0; j < f.outline.length; j++) {
                    if (f.outline[j].xmlrul === feed) {
                        f.outline.splice(j, 1);
                        break;
                    }
                }
                if (!f.outline.length) {
                    $scope.feeds.splice(i, 1);
                    break;
                }
            }
            if (f.xmlurl === feed) {
                $scope.feeds.splice(i, 1);
                $scope.numfeeds--;
                break;
            }
        }
        $scope.stories = $scope.stories.filter(function(e) {
            return e.feed.xmlurl !== feed;
        });
        $http.post('/subscriptions/unsubscribe', { subscription: feed}).success(function(){

        });
        $scope.setActiveFeed();
        $scope.updateStories();
        $scope.updateUnread();
    };

    $scope.moveFeed = function(url, folder) {
        var feed, i, f, j,
            found = false;
        $http.post('/subscriptions/move-to-folder', { subscription: url, folder: folder }).success(function() {

            for (i = 0; i < $scope.feeds.length; i++) {
                f = $scope.feeds[i];
                if (f.outline) {
                    for (j = 0; j < f.outline.length; j++) {
                        var o = f.outline[j];
                        if (o.xmlurl === url) {
                            feed = f.outline[j];
                            f.outline.splice(j, 1);
                            if (!f.outline.length) {
                                $scope.feeds.splice(i, 1);
                            }
                            break;
                        }
                    }
                    if (f.title === folder) {
                        found = true;
                    }
                } else if (f.xmlurl === url) {
                    feed = f;
                    $scope.feeds.splice(i, 1);
                }
            }
            if (!feed) {
                return;
            }
            if (!folder) {
                $scope.feeds.push(feed);
            } else {
                if (!found) {
                    $scope.feeds.push({
                        outline: [],
                        title: folder
                    });
                    $scope.unread.folders[folder] = 0;
                }
                for (i = 0; i < $scope.feeds.length; i++) {
                    f = $scope.feeds[i];
                    if (f.outline && f.title === folder) {
                        $scope.feeds[i].outline.push(feed);
                    }
                }
            }
        });
    };

    $scope.moveFeedNew = function(url) {
        var folder = prompt('New folder name');
        if (!folder) {
            return;
        }
        $scope.moveFeed(url, folder);
    };

    $scope.uploadOpml = function() {
        $scope.http('POST', $('#story-list').attr('data-url-upload'), {
            opml: JSON.stringify($scope.feeds)
        });
    };

    var sl = $('#story-list');
    $scope.readStories = {};
    $scope.cursors = {};
    $scope.fetching = {};
    $scope.getFeed = function() {
        var f = $scope.activeFeed;
        if (!f || $scope.fetching[f]) {
            return;
        }
        if ($scope.dispStories.length !== 0) {
            var sh = sl[0].scrollHeight;
            var h = sl.height();
            var st = sl.scrollTop();
            if (sh - (st + h) > 200) {
                return;
            }
        }
        $scope.http('GET', sl.attr('data-url-get-feed') + '?' + $.param({
                f: f,
                c: $scope.cursors[f] || ''
            })).success(function (data) {
                if (!data || !data.Stories) {
                    return;
                }
                delete $scope.fetching[f];
                $scope.cursors[$scope.activeFeed] = data.Cursor;
                if (!$scope.readStories[f]) {
                    $scope.readStories[f] = [];
                }
                for (var i = 0; i < data.Stories.length; i++) {
                    $scope.procStory(f, data.Stories[i], true);
                    $scope.readStories[f].push(data.Stories[i]);
                }
                $scope.updateStories();
                $scope.applyGetFeed();
            });
        $scope.fetching[f] = true;
    };

    $scope.applyGetFeed = function() {
        if ($scope.opts.mode === 'all') {
            $scope.getFeed();
        }
        if ($scope.opts.expanded) {
            $scope.getVisibleContents();
        }
    };

    $scope.onScroll = _.debounce($scope.applyGetFeed, 300);
    sl.on('scroll', $scope.onScroll);
    $window.onscroll = $scope.onScroll;
    $window.onresize = $scope.onScroll;

    $scope.getVisibleContents = function() {
        var h = sl.height();
        var st = sl.scrollTop();
        var b = st + h + 200;
        var fetched = 0;
        for (var i = 0; i < $scope.dispStories.length && fetched < 10; i++) {
            var s = $scope.dispStories[i];
            if ($scope.contents[s.guid]) {
                continue;
            }
            var sd = $('#storydiv' + i);
            if (!sd.length) {
                continue;
            }
            var sdt = sd.position().top;
            var sdb = sdt + sd.height();
            if (sdt < b && sdb > 0) {
                fetched += 1;
                $scope.getContents(s);
            }
        }
    };

    $scope.setAddSubscription = function() {
        $scope.shown = 'add-subscription';
        // need to wait for the keypress to finish before focusing
        setTimeout(function() {
            $('#add-subscription-form input').focus();
        });
    };

    var shortcuts = $('#shortcuts');
    Mousetrap.bind('?', function() {
        shortcuts.modal('toggle');
    });
    Mousetrap.bind('esc', function() {
        shortcuts.modal('hide');
    });
    Mousetrap.bind('r', function() {
        if ($scope.nouser) {
            return;
        }
        $scope.$apply($scope.refresh());
    });
    Mousetrap.bind(['j', 'n', 'space'], function() {
        $scope.$apply('next()');
    });
    Mousetrap.bind(['k', 'p', 'shift+space'], function() {
        $scope.$apply('prev()');
    });
    Mousetrap.bind('v', function() {
        if ($scope.dispStories[$scope.currentStory]) {
            window.open($scope.dispStories[$scope.currentStory].Link);
        }
    });
    Mousetrap.bind('shift+a', function() {
        if ($scope.nouser) {
            return;
        }
        $scope.$apply($scope.markAllRead());
    });
    Mousetrap.bind('a', function() {
        if ($scope.nouser) {
            return;
        }
        $scope.$apply('setAddSubscription()');
    });
    Mousetrap.bind('g a', function() {
        if ($scope.nouser) {
            return;
        }
        $scope.$apply('shown = \'feeds\'; setActiveFeed();');
    });
    Mousetrap.bind('u', function() {
        $scope.$apply('toggleNav()');
    });
    Mousetrap.bind('1', function() {
        $scope.$apply('setExpanded(true)');
    });
    Mousetrap.bind('2', function() {
        $scope.$apply('setExpanded(false)');
    });

    $scope.showMessage = function(m) {
        $('#message-list').text(m);
        $('#messages').modal('show');
    };

    $scope.setYesterday = function() {
        var d = new Date();
        d.setDate(d.getDate() - 1);
        $scope.http('POST', $('#mark-all-read').attr('data-url'), { last: d.valueOf() });
    };

    $scope.setStarred = function(i) {
        var shownStory = $scope.dispStories[i],
            stories = $scope.stories,
            favorites = $scope.favorites,
            k;

        var story = _.find(stories, function(s) {return s._id === shownStory._id;});
        story.starred = !story.starred;
        if(story.starred) {
            favorites.push(story);
        } else {
            for (k = 0, l = favorites.length; k < l; k++) {
                if(favorites[k]._id === shownStory._id){
                    favorites.splice(k, 1);
                    break;
                }
            }
        }

        $scope.http('POST', '/item/mark-starred', {storyId: shownStory._id, starred: shownStory.starred});
        $scope.updateStories();
    };

    $scope.markUnread = function(storyId) {
        var stories = $scope.stories,
            i, story;
        for(i = 0; i < stories.length; i++) {
            if(stories[i]._id === storyId) {
                story = $scope.stories[i];
                story.read = !story.read;
                $scope.unreadStories[story.guid] = !story.read;
                if(!story.read) {
                    $scope.unread.feeds[story.feed.xmlurl]++;
                } else {
                    $scope.unread.feeds[story.feed.xmlurl]--;
                }
                if(story.feed.folder && !story.read) {
                    $scope.unread.folders[story.feed.folder]++;
                } else if(story.feed.folder && story.read) {
                    $scope.unread.folders[story.feed.folder]--;
                }
            }
        }
        $scope.http('POST', '/item/mark-unread', {storyId: storyId, unread: story.read}).success(function() {
            $scope.updateUnread();
        });
    };

    $scope.shareFacebook = function(url) {
        window.open(
            'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url),
            'facebook-share-dialog',
            'width=626,height=436');
    };

});

goreadmeApp.directive('stopEvent', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            element.bind(attr.stopEvent, function(e) {
                e.stopPropagation();
            });
        }
    };
})
    .directive('starred', function() {

        function updateStarredItem(element, starred) {
            if(starred) {
                element.removeClass('icon-star-empty');
                element.addClass('icon-star');
            } else {
                element.removeClass('icon-star');
                element.addClass('icon-star-empty');
            }
        }

        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                updateStarredItem(element, scope.s.starred);

                $(element).on('click', function() {
                    updateStarredItem($(this), $(element).hasClass('icon-star-empty'));
                });
            }
        };
    });