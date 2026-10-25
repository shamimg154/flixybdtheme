const jo = {};

!(function JetThemeScript() {
  // গ্লোবাল ভেরিয়েবল ও সেটিংস
  var isPreviewMode = typeof isPreview !== "undefined" ? isPreview : false;
  var siteDomain = typeof siteUrl !== "undefined" ? siteUrl.substr(0, siteUrl.length - 1).replace(/(^\w+:|^)\/\//, "") : "";
  var fullSiteUrl = "https://" + siteDomain;
  var currentUrlStr = typeof currentUrl !== "undefined" ? currentUrl : "";
  var blogIdentifier = typeof blogId !== "undefined" ? blogId : "";
  var blogName = typeof blogTitle !== "undefined" ? blogTitle : "";
  var separator = typeof titleSeparator !== "undefined" ? titleSeparator : " - ";
  var pageWord = typeof pageTitle !== "undefined" ? pageTitle : "Page";
  var googleAnalyticsId = typeof analyticId !== "undefined" ? analyticId : false;
  var adsensePubId = typeof caPubAdsense !== "undefined" ? caPubAdsense.replace(/^\D+/g, "") : false;
  var clientAdsense = adsensePubId ? "ca-pub-" + adsensePubId : false;
  var innerAdsTags = typeof innerAdsDelimiter !== "undefined" ? innerAdsDelimiter : "p,br,div";
  var ignoreAdsTags = typeof ignoreAdsDelimiter !== "undefined" ? ignoreAdsDelimiter : "pre,ul,ol,table,blockquote";
  var enableAutoTOC = typeof autoTOC !== "undefined" ? autoTOC : false;
  var tocTemplateFunc = typeof toc_temp === "function" ? toc_temp : false;
  var tocTargetPosition = typeof positionTOC !== "undefined" ? positionTOC : false;
  var customCallback = typeof jtCallback === "function" ? jtCallback : false;

  // DOM এলিমেন্টস
  var header = document.getElementById("header");
  var searchToggle = document.getElementById("search-toggle");
  var searchHeader = document.getElementById("search-header");
  var navbarToggle = document.getElementById("navbar-toggle");
  var navbar = document.getElementById("navbar");
  var backToTopBtn = document.getElementById("back-to-top");
  var darkToggler = document.getElementById("dark-toggler");
  var htmlRoot = document.querySelector("html");
  var commentBtn = document.getElementById("comment-button");
  var commentForm = document.getElementById("threaded-comment-form");
  var commentEditor = document.getElementById("comment-editor");
  var commentEditorSrc = document.getElementById("comment-editor-src");
  var commentScript = document.getElementById("comment-script");
  var replyBtns = document.querySelectorAll(".comment-reply");
  var entryNoScripts = document.querySelectorAll(".entry-text noscript");
  var contactForms = document.querySelectorAll(".contact-form-blogger");
  var adsPostContainer = document.getElementById("ads-post");
  var postBody = document.getElementById("post-body");
  var relatedPosts = document.querySelector(".related-posts");
  var relatedInline = document.querySelector(".related-inline");

  // ক্লাস ম্যানিপুলেশন হেল্পার ফাংশন
  function hasClass(element, className) {
    return (" " + element.className + " ").indexOf(" " + className + " ") > -1;
  }

  function addClass(element, className) {
    if (!hasClass(element, className)) {
      element.className = (element.className ? element.className + " " : "") + className;
    }
  }

  function removeClass(element, className) {
    element.className = element.className.replace(new RegExp("(?:^|\\s)" + className + "(?!\\S)"), "").trim();
  }

  function toggleClass(element, className) {
    if (hasClass(element, className)) {
      removeClass(element, className);
    } else {
      addClass(element, className);
    }
  }

  // ডার্ক মোড হ্যান্ডলার
  if (darkToggler) {
    darkToggler.addEventListener("click", function (event) {
      event.preventDefault();
      toggleClass(htmlRoot, "dark-mode");
      if (localStorage !== null) {
        localStorage.setItem("theme", hasClass(htmlRoot, "dark-mode") ? "dark" : "light");
      }
    });
  }

  // স্ক্রল হ্যান্ডলার (হেডার দেখানো/লুকানো এবং ব্যাক-টু-টপ বাটন)
  window.addEventListener("scroll", function () {
    var scrollPos = this.pageYOffset;
    if (scrollPos >= 1 && header !== null) {
      addClass(header, "shadow-sm");
    } else if (header !== null) {
      removeClass(header, "shadow-sm");
    }

    if (scrollPos >= 1000 && backToTopBtn !== null) {
      removeClass(backToTopBtn, "d-none");
    } else if (backToTopBtn !== null) {
      addClass(backToTopBtn, "d-none");
    }
  }, false);

  // কমেন্ট বক্স ওপেন করার ফাংশন
  function loadCommentFrame(url) {
    if (url !== commentEditorSrc.href) {
      addClass(commentForm, "loader");
      commentEditorSrc.href = url;
      commentEditor.src = url;
    }
    if (hasClass(commentForm, "d-none")) {
      removeClass(commentForm, "d-none");
      var scriptSrc = commentScript.value.match(/<script.*?src='(.*?)'/)[1];
      Defer.js(scriptSrc, "comment-js", 500, function () {
        BLOG_CMT_createIframe("https://www.blogger.com/rpc_relay.html");
      });
    }
  }

  if (commentBtn) {
    commentBtn.addEventListener("click", function (e) {
      e.preventDefault();
      loadCommentFrame(this.href);
      if (commentForm.parentElement.id !== "add-comment") {
        document.getElementById("add-comment").appendChild(commentForm);
      }
    });
  }

  // কমেন্ট রিপ্লাই বাটন সেটআপ
  for (var i = 0; i < replyBtns.length; i++) {
    replyBtns[i].addEventListener("click", function (e) {
      e.preventDefault();
      var commentId = this.getAttribute("data-comment-id");
      loadCommentFrame(this.href);
      if (commentForm.parentElement.id !== "c" + commentId) {
        document.getElementById("c" + commentId).appendChild(commentForm);
      }
    });
  }

  // ব্লগের কন্টাক্ট ফর্ম সাবমিশন
  for (var j = 0; j < contactForms.length; j++) {
    contactForms[j].addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;
      addClass(form, "loading");
      var formData = new FormData(form);
      var postParams = "blogID=" + blogIdentifier;
      formData.forEach(function (val, key) {
        postParams += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(val);
      });

      var xhr = new XMLHttpRequest();
      xhr.open("post", "https://www.blogger.com/contact-form.do");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(postParams);
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          removeClass(form, "loading");
          if (this.status === 200 && this.response !== "") {
            var res = JSON.parse(this.responseText.trim());
            if (res && res.details.emailSentStatus === "true") {
              form.reset();
              removeClass(form, "send-error");
              addClass(form, "send-success");
            } else {
              removeClass(form, "send-success");
              addClass(form, "send-error");
            }
          }
        }
      };
    });
  }

  // পোস্ট পেজিনেশন ও অটোমেটিক ইন-ফিড অ্যাডস হ্যান্ডলার
  function initPostFeatures(eventTriggered) {
    // পোস্টের ভেতরে বিজ্ঞাপন ঢোকানো
    if (postBody !== null && adsPostContainer !== null) {
      var delimiterElements = postBody.querySelectorAll(innerAdsTags + "," + ignoreAdsTags);
      var adElements = adsPostContainer.childNodes;
      var totalAds = adElements.length;
      var validTargetElements = [];

      for (var k = 0; k < delimiterElements.length; k++) {
        var ignored = delimiterElements[k].closest(ignoreAdsTags);
        if (!ignored || delimiterElements[k] === ignored) {
          validTargetElements.push(delimiterElements[k]);
        }
      }

      for (var l = 0; l < totalAds; l++) {
        if (l === totalAds - 1) {
          postBody.appendChild(adElements[0]);
        } else {
          var targetIndex = Math.round((validTargetElements.length / totalAds) * l);
          var targetElement = l === 0 ? validTargetElements[0] : validTargetElements[targetIndex].nextSibling;
          if (targetElement) {
            targetElement.parentElement.insertBefore(adElements[0], targetElement);
          }
        }
      }
    }
  }

  // লেজি-লোড ইভেন্ট বাইন্ডিং
  window.addEventListener("scroll", initPostFeatures, { once: true });
})();
