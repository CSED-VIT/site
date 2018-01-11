/* Debouncer
 * A debouncer function from Underscore, taken from
 * https://davidwalsh.name/javascript-debounce-function
 *
 * var debouncedAnimationHandler = debounce(function() {}, 25);
 * window.addEventListener("scroll", debouncedAnimationHandler, false);
 *
 */
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

/* Hotjar Tag Once
 * Tags a recording with the given tag
 */
function tagHotjarRecording( tag ) {
  if (typeof hj === 'function' ) {
		hj('tagRecording', [tag]);
	};
}

/* Submit HotJar Form Success
 * Submit a success event to HotJar
 */
function submitHotjarFormSuccess() {
  if (typeof hj === 'function' ) {
		hj('formSubmitSuccessful');
	};
}


/* Submit HotJar Form Failed
 * Submit a success event to HotJar
 */
function submitHotjarFormFailed() {
  if (typeof hj === 'function' ) {
		hj('formSubmitFailed');
	};
}

(function($) {
	$.kinstaSiteNavigation = function(element, options) {
		var plugin = this;
		plugin.settings = {}

		var defaults = {};
		var $element = $(element);
		var $html = $('html');
		var $body = $('body');

		plugin.init = function() {
			plugin.settings = $.extend({}, defaults, options);

			plugin.isHoverNav = null;
			plugin.isMobileNav = false;
			plugin.minFloatPoint = plugin.findMinFloatPoint();
			plugin.hoverHideOffset = null;

			plugin.$hoverMenu = null
			plugin.$mobileMenu = $element.find('.site-menu__nav ul').clone();
			plugin.$mobileOverlay = $('<div id="mobile-nav-overlay"><div class="container"></div></div>')
			plugin.$mobileMenu.prependTo(plugin.$mobileOverlay.find('.container'))

			$body.prepend(plugin.$mobileOverlay);
			plugin.scrollHandler();
			window.addEventListener( 'scroll', plugin.scrollHandler, false);
			$(document).on('click', '.site-menu__hamburger', plugin.hamburgerClickHandler)

		}

		plugin.findMinFloatPoint = function() {
			var resourceBar = $('.resource-bar:first');
			var siteHeader = $('#site-header');
			var minPoint = 400;
			if(resourceBar.length > 0 ) {
				minPoint = resourceBar.offset().top + resourceBar.height();
			} else if (siteHeader.length > 0) {
				minPoint = siteHeader.height();
			}

			return minPoint;
		}

		plugin.createHoverMenu = function() {
			var hoverMenu = $element.clone();

			hoverMenu.attr('id', 'site-menu--hover')
			.prependTo($body)

			plugin.hoverHideOffset = -hoverMenu.outerHeight();

			hoverMenu.css({
				top: plugin.hoverHideOffset + 'px',
				display:'none'
			})

			plugin.$hoverMenu = hoverMenu;
		}

		plugin.createMobileMenu = function() {

		}

		plugin.showHoverNav = function() {
			$html.addClass('hoverNav');
			plugin.isHoverNav = true;
		}

		plugin.hideHoverNav = function() {
			$html.removeClass('hoverNav');
			plugin.isHoverNav = false;
		}

		plugin.showMobileNav = function() {
			$html.addClass('mobileNav');
			plugin.isMobileNav = true;
		}

		plugin.hideMobileNav = function() {
			$html.removeClass('mobileNav');
			plugin.isMobileNav = false;
		}


		plugin.scrollHandler = function() {
			if( window.scrollY >= plugin.minFloatPoint ) {
				plugin.showHoverNav();

				if( plugin.$hoverMenu === null ) {
					plugin.createHoverMenu();
				}

				var position = window.scrollY - plugin.minFloatPoint + plugin.hoverHideOffset;

				plugin.$hoverMenu.css({
					top: position > 0 ? '0px' : position + 'px',
					display:'block'
				})

			} else if( plugin.$hoverMenu ) {
				plugin.$hoverMenu.css({
					top: plugin.hoverHideOffset,
					display: 'none'
				})

				plugin.hideHoverNav();
			}
		}

		plugin.hamburgerClickHandler = function() {
			if( !plugin.isMobileNav ) {
				plugin.showMobileNav();

				if(plugin.isHoverNav) {
					plugin.$mobileOverlay.prependTo(plugin.$hoverMenu)
				} else {
					plugin.$mobileOverlay.prependTo($element)
				}

				plugin.$mobileOverlay.animate({
					top: 0
				}, 200, function() {
					plugin.$mobileMenu.fadeIn();
				})

			} else {
				plugin.$mobileMenu.fadeOut(100, function() {
					plugin.$mobileOverlay.animate({
						top: '-100vh'
					}, 200, function() {
						plugin.hideMobileNav();
					})

				});
			}

		}


		plugin.init();

  }

  $.fn.kinstaSiteNavigation = function(options) {
    return this.each(function() {
      if (undefined == $(this).data('kinstaSiteNavigation')) {
        var plugin = new $.kinstaSiteNavigation(this, options);
        $(this).data('kinstaSiteNavigation', plugin);
      }
    });
  }

})(jQuery);

(function($) {
	$.kinstaStickySidebar = function(element, options) {
		var plugin = this;
		plugin.settings = {}

		var defaults = {};
		var $element = $(element);
		var $html = $('html');
    var $sidebar = $('#sidebar');
    var $sidebarBottom = $('#sidebar__bottom');

    $element.width($element.width());

		plugin.init = function() {
			plugin.settings = $.extend({}, defaults, options);
      plugin.state = null // default, stuckTop, stuckBottom

      plugin.stickTopPoint = $element.offset().top;
      plugin.stickBottomPoint = $sidebarBottom.length > 0 ? $sidebarBottom.offset().top : $sidebar.offset().top + $sidebar.outerHeight();
      plugin.stickBackPoint = null;

			if( $element.height() + 200 < $sidebar.height() ) {
      	plugin.scrollHandler();
				window.addEventListener( 'scroll', plugin.scrollHandler, false);
			}

		}

    plugin.setState = function(state) {
      if( state === plugin.state ) {
        return;
      }
      plugin.state = state;
      var className = 'stickySidebar--' + state;
      $html.removeClass('stickySidebar--default stickySidebar--stuckTop stickySidebar--stuckBottom');
      $html.addClass(className)
    }

    plugin.scrollHandler = function() {

      if( window.scrollY + 42 >= plugin.stickTopPoint && window.scrollY + $element.outerHeight() + 80 <= plugin.stickBottomPoint ) {
        plugin.setState('stuckTop')
      } else {
        if(window.scrollY < plugin.stickTopPoint) {
          plugin.setState('default')
        } else {
          plugin.setState('stuckBottom')
        }
      }

    }


		plugin.init();

  }

  $.fn.kinstaStickySidebar = function(options) {
    return this.each(function() {
      if (undefined == $(this).data('kinstaStickySidebar')) {
        var plugin = new $.kinstaStickySidebar(this, options);
        $(this).data('kinstaStickySidebar', plugin);
      }
    });
  }

})(jQuery);


(function($) {
	$.kinstaPromoWidget = function(element, options) {
		var plugin = this;
		plugin.settings = {}

		var defaults = {};
		var $element = $(element);
    var $collapsable = $('#kinsta-promo-widget__collapsable');
    var collapsableHeight = $collapsable.outerHeight();

		plugin.init = function() {
			plugin.settings = $.extend({}, defaults, options);
      plugin.scrollHandler();
			window.addEventListener( 'scroll', plugin.scrollHandler, false);
		}

    plugin.scrollHandler = function() {
      var scrollY = window.scrollY;
      if( scrollY > 600 && scrollY < collapsableHeight + 620 ) {
        var height = collapsableHeight - (scrollY - 600);
        $collapsable.css({ height: height})
      }
      if( scrollY >= collapsableHeight + 620 ) {
        $collapsable.css({ height: 0})
      }
      if( scrollY < 580 ) {
        $collapsable.css({ height: collapsableHeight })
      }

    }


		plugin.init();

  }

  $.fn.kinstaPromoWidget = function(options) {
    return this.each(function() {
      if (undefined == $(this).data('kinstaPromoWidget')) {
        var plugin = new $.kinstaPromoWidget(this, options);
        $(this).data('kinstaPromoWidget', plugin);
      }
    });
  }

})(jQuery);


!function(t,e){"function"==typeof define&&define.amd?define(function(){return e(t)}):"object"==typeof module&&module.exports?module.exports=e(t):(t.lottie=e(t),t.bodymovin=t.lottie)}(window||{},function(window){function ProjectInterface(){return{}}function roundValues(t){bm_rnd=t?Math.round:function(t){return t}}function styleDiv(t){t.style.position="absolute",t.style.top=0,t.style.left=0,t.style.display="block",t.style.transformOrigin=t.style.webkitTransformOrigin="0 0",t.style.backfaceVisibility=t.style.webkitBackfaceVisibility="visible",t.style.transformStyle=t.style.webkitTransformStyle=t.style.mozTransformStyle="preserve-3d"}function styleUnselectableDiv(t){t.style.userSelect="none",t.style.MozUserSelect="none",t.style.webkitUserSelect="none",t.style.oUserSelect="none"}function BMEnterFrameEvent(t,e,r,s){this.type=t,this.currentTime=e,this.totalTime=r,this.direction=0>s?-1:1}function BMCompleteEvent(t,e){this.type=t,this.direction=0>e?-1:1}function BMCompleteLoopEvent(t,e,r,s){this.type=t,this.currentLoop=e,this.totalLoops=r,this.direction=0>s?-1:1}function BMSegmentStartEvent(t,e,r){this.type=t,this.firstFrame=e,this.totalFrames=r}function BMDestroyEvent(t,e){this.type=t,this.target=e}function _addEventListener(t,e){return this._cbs[t]||(this._cbs[t]=[]),this._cbs[t].push(e),function(){this.removeEventListener(t,e)}.bind(this)}function _removeEventListener(t,e){if(e){if(this._cbs[t]){for(var r=0,s=this._cbs[t].length;s>r;)this._cbs[t][r]===e&&(this._cbs[t].splice(r,1),r-=1,s-=1),r+=1;this._cbs[t].length||(this._cbs[t]=null)}}else this._cbs[t]=null}function _triggerEvent(t,e){if(this._cbs[t])for(var r=this._cbs[t].length,s=0;r>s;s++)this._cbs[t][s](e)}function randomString(t,e){void 0===e&&(e="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");var r,s="";for(r=t;r>0;--r)s+=e[Math.round(Math.random()*(e.length-1))];return s}function HSVtoRGB(t,e,r){var s,i,a,n,o,h,l,p;switch(1===arguments.length&&(e=t.s,r=t.v,t=t.h),n=Math.floor(6*t),o=6*t-n,h=r*(1-e),l=r*(1-o*e),p=r*(1-(1-o)*e),n%6){case 0:s=r,i=p,a=h;break;case 1:s=l,i=r,a=h;break;case 2:s=h,i=r,a=p;break;case 3:s=h,i=l,a=r;break;case 4:s=p,i=h,a=r;break;case 5:s=r,i=h,a=l}return[s,i,a]}function RGBtoHSV(t,e,r){1===arguments.length&&(e=t.g,r=t.b,t=t.r);var s,i=Math.max(t,e,r),a=Math.min(t,e,r),n=i-a,o=0===i?0:n/i,h=i/255;switch(i){case a:s=0;break;case t:s=e-r+n*(r>e?6:0),s/=6*n;break;case e:s=r-t+2*n,s/=6*n;break;case r:s=t-e+4*n,s/=6*n}return[s,o,h]}function addSaturationToRGB(t,e){var r=RGBtoHSV(255*t[0],255*t[1],255*t[2]);return r[1]+=e,r[1]>1?r[1]=1:r[1]<=0&&(r[1]=0),HSVtoRGB(r[0],r[1],r[2])}function addBrightnessToRGB(t,e){var r=RGBtoHSV(255*t[0],255*t[1],255*t[2]);return r[2]+=e,r[2]>1?r[2]=1:r[2]<0&&(r[2]=0),HSVtoRGB(r[0],r[1],r[2])}function addHueToRGB(t,e){var r=RGBtoHSV(255*t[0],255*t[1],255*t[2]);return r[0]+=e/360,r[0]>1?r[0]-=1:r[0]<0&&(r[0]+=1),HSVtoRGB(r[0],r[1],r[2])}function createElement(t,e,r){if(!e){var s=Object.create(t.prototype,r),i={};return s&&"[object Function]"===i.toString.call(s.init)&&s.init(),s}e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.prototype._parent=t.prototype}function extendPrototype(t,e){for(var r in t.prototype)t.prototype.hasOwnProperty(r)&&(e.prototype[r]=t.prototype[r])}function bezFunction(){function t(t,e,r,s,i,a){var n=t*s+e*i+r*a-i*s-a*t-r*e;return n>-1e-4&&1e-4>n}function e(e,r,s,i,a,n,o,h,l){if(0===s&&0===n&&0===l)return t(e,r,i,a,o,h);var p,m=Math.sqrt(Math.pow(i-e,2)+Math.pow(a-r,2)+Math.pow(n-s,2)),f=Math.sqrt(Math.pow(o-e,2)+Math.pow(h-r,2)+Math.pow(l-s,2)),c=Math.sqrt(Math.pow(o-i,2)+Math.pow(h-a,2)+Math.pow(l-n,2));return p=m>f?m>c?m-f-c:c-f-m:c>f?c-f-m:f-m-c,p>-1e-4&&1e-4>p}function r(t){var e,r=t.c,s=t.v,i=t.o,a=t.i,n=t._length,o=[],h=0;for(e=0;n-1>e;e+=1)o[e]=l(s[e],s[e+1],i[e],a[e+1]),h+=o[e].addedLength;return r&&(o[e]=l(s[e],s[0],i[e],a[0]),h+=o[e].addedLength),{lengths:o,totalLength:h}}function s(t){this.segmentLength=0,this.points=new Array(t)}function i(t,e){this.partialLength=t,this.point=e}function a(t,e){var r=e.segments,s=r.length,i=bm_floor((s-1)*t),a=t*e.addedLength,n=0;if(a==r[i].l)return r[i].p;for(var o=r[i].l>a?-1:1,h=!0;h;)r[i].l<=a&&r[i+1].l>a?(n=(a-r[i].l)/(r[i+1].l-r[i].l),h=!1):i+=o,(0>i||i>=s-1)&&(h=!1);return r[i].p+(r[i+1].p-r[i].p)*n}function n(){this.pt1=new Array(2),this.pt2=new Array(2),this.pt3=new Array(2),this.pt4=new Array(2)}function o(t,e,r,s,i,n){var o=a(i,n),h=1-o,l=Math.round(1e3*(h*h*h*t[0]+(o*h*h+h*o*h+h*h*o)*r[0]+(o*o*h+h*o*o+o*h*o)*s[0]+o*o*o*e[0]))/1e3,p=Math.round(1e3*(h*h*h*t[1]+(o*h*h+h*o*h+h*h*o)*r[1]+(o*o*h+h*o*o+o*h*o)*s[1]+o*o*o*e[1]))/1e3;return[l,p]}function h(t,e,r,s,i,o,h){var l=new n;i=0>i?0:i>1?1:i;var p=a(i,h);o=o>1?1:o;var m,f=a(o,h),c=t.length,d=1-p,u=1-f;for(m=0;c>m;m+=1)l.pt1[m]=Math.round(1e3*(d*d*d*t[m]+(p*d*d+d*p*d+d*d*p)*r[m]+(p*p*d+d*p*p+p*d*p)*s[m]+p*p*p*e[m]))/1e3,l.pt3[m]=Math.round(1e3*(d*d*u*t[m]+(p*d*u+d*p*u+d*d*f)*r[m]+(p*p*u+d*p*f+p*d*f)*s[m]+p*p*f*e[m]))/1e3,l.pt4[m]=Math.round(1e3*(d*u*u*t[m]+(p*u*u+d*f*u+d*u*f)*r[m]+(p*f*u+d*f*f+p*u*f)*s[m]+p*f*f*e[m]))/1e3,l.pt2[m]=Math.round(1e3*(u*u*u*t[m]+(f*u*u+u*f*u+u*u*f)*r[m]+(f*f*u+u*f*f+f*u*f)*s[m]+f*f*f*e[m]))/1e3;return l}var l=(Math,function(){function t(t,e){this.l=t,this.p=e}return function(e,r,s,i){var a,n,o,h,l,p,m=defaultCurveSegments,f=0,c=[],d=[],u={addedLength:0,segments:Array.apply(null,{length:m})};for(o=s.length,a=0;m>a;a+=1){for(l=a/(m-1),p=0,n=0;o>n;n+=1)h=bm_pow(1-l,3)*e[n]+3*bm_pow(1-l,2)*l*s[n]+3*(1-l)*bm_pow(l,2)*i[n]+bm_pow(l,3)*r[n],c[n]=h,null!==d[n]&&(p+=bm_pow(c[n]-d[n],2)),d[n]=c[n];p&&(p=bm_sqrt(p),f+=p),u.segments[a]=new t(f,l)}return u.addedLength=f,u}}()),p=function(){var e={};return function(r){var a=r.s,n=r.e,o=r.to,h=r.ti,l=(a.join("_")+"_"+n.join("_")+"_"+o.join("_")+"_"+h.join("_")).replace(/\./g,"p");if(e[l])return void(r.bezierData=e[l]);var p,m,f,c,d,u,y,g=defaultCurveSegments,v=0,b=null;2===a.length&&(a[0]!=n[0]||a[1]!=n[1])&&t(a[0],a[1],n[0],n[1],a[0]+o[0],a[1]+o[1])&&t(a[0],a[1],n[0],n[1],n[0]+h[0],n[1]+h[1])&&(g=2);var E=new s(g);for(f=o.length,p=0;g>p;p+=1){for(y=new Array(f),d=p/(g-1),u=0,m=0;f>m;m+=1)c=bm_pow(1-d,3)*a[m]+3*bm_pow(1-d,2)*d*(a[m]+o[m])+3*(1-d)*bm_pow(d,2)*(n[m]+h[m])+bm_pow(d,3)*n[m],y[m]=c,null!==b&&(u+=bm_pow(y[m]-b[m],2));u=bm_sqrt(u),v+=u,E.points[p]=new i(u,y),b=y}E.segmentLength=v,r.bezierData=E,e[l]=E}}();return{getBezierLength:l,getSegmentsLength:r,getNewSegment:h,getPointInSegment:o,buildBezierData:p,pointOnLine2D:t,pointOnLine3D:e}}function dataFunctionManager(){function t(i,a,o){var h,l,p,m,f,c,d,u,y=i.length;for(m=0;y>m;m+=1)if(h=i[m],"ks"in h&&!h.completed){if(h.completed=!0,h.tt&&(i[m-1].td=h.tt),l=[],p=-1,h.hasMask){var g=h.masksProperties;for(c=g.length,f=0;c>f;f+=1)if(g[f].pt.k.i)s(g[f].pt.k);else for(u=g[f].pt.k.length,d=0;u>d;d+=1)g[f].pt.k[d].s&&s(g[f].pt.k[d].s[0]),g[f].pt.k[d].e&&s(g[f].pt.k[d].e[0])}0===h.ty?(h.layers=e(h.refId,a),t(h.layers,a,o)):4===h.ty?r(h.shapes):5==h.ty&&n(h,o)}}function e(t,e){for(var r=0,s=e.length;s>r;){if(e[r].id===t)return e[r].layers.__used?JSON.parse(JSON.stringify(e[r].layers)):(e[r].layers.__used=!0,e[r].layers);r+=1}}function r(t){var e,i,a,n=t.length,o=!1;for(e=n-1;e>=0;e-=1)if("sh"==t[e].ty){if(t[e].ks.k.i)s(t[e].ks.k);else for(a=t[e].ks.k.length,i=0;a>i;i+=1)t[e].ks.k[i].s&&s(t[e].ks.k[i].s[0]),t[e].ks.k[i].e&&s(t[e].ks.k[i].e[0]);o=!0}else"gr"==t[e].ty&&r(t[e].it)}function s(t){var e,r=t.i.length;for(e=0;r>e;e+=1)t.i[e][0]+=t.v[e][0],t.i[e][1]+=t.v[e][1],t.o[e][0]+=t.v[e][0],t.o[e][1]+=t.v[e][1]}function i(t,e){var r=e?e.split("."):[100,100,100];return t[0]>r[0]?!0:r[0]>t[0]?!1:t[1]>r[1]?!0:r[1]>t[1]?!1:t[2]>r[2]?!0:r[2]>t[2]?!1:void 0}function a(e,r){e.__complete||(l(e),o(e),h(e),p(e),t(e.layers,e.assets,r),e.__complete=!0)}function n(t,e){0!==t.t.a.length||"m"in t.t.p||(t.singleShape=!0)}var o=function(){function t(t){var e=t.t.d;t.t.d={k:[{s:e,t:0}]}}function e(e){var r,s=e.length;for(r=0;s>r;r+=1)5===e[r].ty&&t(e[r])}var r=[4,4,14];return function(t){if(i(r,t.v)&&(e(t.layers),t.assets)){var s,a=t.assets.length;for(s=0;a>s;s+=1)t.assets[s].layers&&e(t.assets[s].layers)}}}(),h=function(){var t=[4,7,99];return function(e){if(e.chars&&!i(t,e.v)){var r,a,n,o,h,l=e.chars.length;for(r=0;l>r;r+=1)if(e.chars[r].data&&e.chars[r].data.shapes)for(h=e.chars[r].data.shapes[0].it,n=h.length,a=0;n>a;a+=1)o=h[a].ks.k,o.__converted||(s(h[a].ks.k),o.__converted=!0)}}}(),l=function(){function t(e){var r,s,i,a=e.length;for(r=0;a>r;r+=1)if("gr"===e[r].ty)t(e[r].it);else if("fl"===e[r].ty||"st"===e[r].ty)if(e[r].c.k&&e[r].c.k[0].i)for(i=e[r].c.k.length,s=0;i>s;s+=1)e[r].c.k[s].s&&(e[r].c.k[s].s[0]/=255,e[r].c.k[s].s[1]/=255,e[r].c.k[s].s[2]/=255,e[r].c.k[s].s[3]/=255),e[r].c.k[s].e&&(e[r].c.k[s].e[0]/=255,e[r].c.k[s].e[1]/=255,e[r].c.k[s].e[2]/=255,e[r].c.k[s].e[3]/=255);else e[r].c.k[0]/=255,e[r].c.k[1]/=255,e[r].c.k[2]/=255,e[r].c.k[3]/=255}function e(e){var r,s=e.length;for(r=0;s>r;r+=1)4===e[r].ty&&t(e[r].shapes)}var r=[4,1,9];return function(t){if(i(r,t.v)&&(e(t.layers),t.assets)){var s,a=t.assets.length;for(s=0;a>s;s+=1)t.assets[s].layers&&e(t.assets[s].layers)}}}(),p=function(){function t(e){var r,s,i,a=e.length,n=!1;for(r=a-1;r>=0;r-=1)if("sh"==e[r].ty){if(e[r].ks.k.i)e[r].ks.k.c=e[r].closed;else for(i=e[r].ks.k.length,s=0;i>s;s+=1)e[r].ks.k[s].s&&(e[r].ks.k[s].s[0].c=e[r].closed),e[r].ks.k[s].e&&(e[r].ks.k[s].e[0].c=e[r].closed);n=!0}else"gr"==e[r].ty&&t(e[r].it)}function e(e){var r,s,i,a,n,o,h=e.length;for(s=0;h>s;s+=1){if(r=e[s],r.hasMask){var l=r.masksProperties;for(a=l.length,i=0;a>i;i+=1)if(l[i].pt.k.i)l[i].pt.k.c=l[i].cl;else for(o=l[i].pt.k.length,n=0;o>n;n+=1)l[i].pt.k[n].s&&(l[i].pt.k[n].s[0].c=l[i].cl),l[i].pt.k[n].e&&(l[i].pt.k[n].e[0].c=l[i].cl)}4===r.ty&&t(r.shapes)}}var r=[4,4,18];return function(t){if(i(r,t.v)&&(e(t.layers),t.assets)){var s,a=t.assets.length;for(s=0;a>s;s+=1)t.assets[s].layers&&e(t.assets[s].layers)}}}(),m={};return m.completeData=a,m}function ShapePath(){this.c=!1,this._length=0,this._maxLength=8,this.v=Array.apply(null,{length:this._maxLength}),this.o=Array.apply(null,{length:this._maxLength}),this.i=Array.apply(null,{length:this._maxLength})}function ShapeModifier(){}function TrimModifier(){}function RoundCornersModifier(){}function RepeaterModifier(){}function ShapeCollection(){this._length=0,this._maxLength=4,this.shapes=Array.apply(null,{length:this._maxLength})}function DashProperty(t,e,r,s){this.elem=t,this.frameId=-1,this.dataProps=Array.apply(null,{length:e.length}),this.renderer=r,this.mdf=!1,this.k=!1,this.dashStr="",this.dashArray=createTypedArray("float32",e.length-1),this.dashoffset=createTypedArray("float32",1);var i,a,n=e.length;for(i=0;n>i;i+=1)a=PropertyFactory.getProp(t,e[i].v,0,0,s),this.k=a.k?!0:this.k,this.dataProps[i]={n:e[i].n,p:a};this.k?s.push(this):this.getValue(!0)}function GradientProperty(t,e,r){this.prop=PropertyFactory.getProp(t,e.k,1,null,[]),this.data=e,this.k=this.prop.k,this.c=createTypedArray("uint8c",4*e.p);var s=e.k.k[0].s?e.k.k[0].s.length-4*e.p:e.k.k.length-4*e.p;this.o=createTypedArray("float32",s),this.cmdf=!1,this.omdf=!1,this.prop.k&&r.push(this),this.getValue(!0)}function TextAnimatorProperty(t,e,r){this.mdf=!1,this._firstFrame=!0,this._hasMaskedPath=!1,this._frameId=-1,this._dynamicProperties=[],this._textData=t,this._renderType=e,this._elem=r,this._animatorsData=Array.apply(null,{length:this._textData.a.length}),this._pathData={},this._moreOptions={alignment:{}},this.renderedLetters=[],this.lettersChangedFlag=!1}function LetterProps(t,e,r,s,i,a){this.o=t,this.sw=e,this.sc=r,this.fc=s,this.m=i,this.p=a,this.mdf={o:!0,sw:!!e,sc:!!r,fc:!!s,m:!0,p:!0}}function TextProperty(t,e,r){this._frameId=-99999,this.pv="",this.v="",this.kf=!1,this.firstFrame=!0,this.mdf=!0,this.data=e,this.elem=t,this.keysIndex=-1,this.currentData={ascent:0,boxWidth:[0,0],f:"",fStyle:"",fWeight:"",fc:"",j:"",justifyOffset:"",l:[],lh:0,lineWidths:[],ls:"",of:"",s:"",sc:"",sw:0,t:0,tr:0,fillColorAnim:!1,strokeColorAnim:!1,strokeWidthAnim:!1,yOffset:0,__complete:!1},this.searchProperty()?r.push(this):this.getValue(!0)}function BaseRenderer(){}function SVGRenderer(t,e){this.animationItem=t,this.layers=null,this.renderedFrame=-1,this.globalData={frameNum:-1},this.renderConfig={preserveAspectRatio:e&&e.preserveAspectRatio||"xMidYMid meet",progressiveLoad:e&&e.progressiveLoad||!1,hideOnTransparent:e&&e.hideOnTransparent===!1?!1:!0,viewBoxOnly:e&&e.viewBoxOnly||!1,className:e&&e.className||""},this.globalData.renderConfig=this.renderConfig,this.elements=[],this.pendingElements=[],this.destroyed=!1}function MaskElement(t,e,r){this.dynamicProperties=[],this.data=t,this.element=e,this.globalData=r,this.storedData=[],this.masksProperties=this.data.masksProperties,this.viewData=Array.apply(null,{length:this.masksProperties.length}),this.maskElement=null,this.firstFrame=!0;var s,i,a,n,o,h,l,p,m=this.globalData.defs,f=this.masksProperties.length,c=this.masksProperties,d=0,u=[],y=randomString(10),g="clipPath",v="clip-path";for(s=0;f>s;s++)if(("a"!==c[s].mode&&"n"!==c[s].mode||c[s].inv||100!==c[s].o.k)&&(g="mask",v="mask"),"s"!=c[s].mode&&"i"!=c[s].mode||0!=d?o=null:(o=document.createElementNS(svgNS,"rect"),o.setAttribute("fill","#ffffff"),o.setAttribute("width",this.element.comp.data.w),o.setAttribute("height",this.element.comp.data.h),u.push(o)),i=document.createElementNS(svgNS,"path"),"n"!=c[s].mode){if(d+=1,"s"==c[s].mode?i.setAttribute("fill","#000000"):i.setAttribute("fill","#ffffff"),i.setAttribute("clip-rule","nonzero"),0!==c[s].x.k){g="mask",v="mask",p=PropertyFactory.getProp(this.element,c[s].x,0,null,this.dynamicProperties);var b="fi_"+randomString(10);h=document.createElementNS(svgNS,"filter"),h.setAttribute("id",b),l=document.createElementNS(svgNS,"feMorphology"),l.setAttribute("operator","dilate"),l.setAttribute("in","SourceGraphic"),l.setAttribute("radius","0"),h.appendChild(l),m.appendChild(h),"s"==c[s].mode?i.setAttribute("stroke","#000000"):i.setAttribute("stroke","#ffffff")}else l=null,p=null;if(this.storedData[s]={elem:i,x:p,expan:l,lastPath:"",lastOperator:"",filterId:b,lastRadius:0},"i"==c[s].mode){n=u.length;var E=document.createElementNS(svgNS,"g");for(a=0;n>a;a+=1)E.appendChild(u[a]);var P=document.createElementNS(svgNS,"mask");P.setAttribute("mask-type","alpha"),P.setAttribute("id",y+"_"+d),P.appendChild(i),m.appendChild(P),E.setAttribute("mask","url("+locationHref+"#"+y+"_"+d+")"),u.length=0,u.push(E)}else u.push(i);c[s].inv&&!this.solidPath&&(this.solidPath=this.createLayerSolidPath()),this.viewData[s]={elem:i,lastPath:"",op:PropertyFactory.getProp(this.element,c[s].o,0,.01,this.dynamicProperties),prop:ShapePropertyFactory.getShapeProp(this.element,c[s],3,this.dynamicProperties,null)},o&&(this.viewData[s].invRect=o),this.viewData[s].prop.k||this.drawPath(c[s],this.viewData[s].prop.v,this.viewData[s])}else this.viewData[s]={op:PropertyFactory.getProp(this.element,c[s].o,0,.01,this.dynamicProperties),prop:ShapePropertyFactory.getShapeProp(this.element,c[s],3,this.dynamicProperties,null),elem:i},m.appendChild(i);for(this.maskElement=document.createElementNS(svgNS,g),f=u.length,s=0;f>s;s+=1)this.maskElement.appendChild(u[s]);this.maskElement.setAttribute("id",y),d>0&&this.element.maskedElement.setAttribute(v,"url("+locationHref+"#"+y+")"),m.appendChild(this.maskElement)}function BaseElement(){}function SVGBaseElement(t,e,r,s,i){this.globalData=r,this.comp=s,this.data=t,this.matteElement=null,this.transformedElement=null,this.isTransparent=!1,this.parentContainer=e,this.layerId=i?i.layerId:"ly_"+randomString(10),this.placeholder=i,this._sizeChanged=!1,this.init()}function IShapeElement(t,e,r,s,i){this.shapes=[],this.shapesData=t.shapes,this.stylesList=[],this.itemsData=[],this.prevViewData=[],this.shapeModifiers=[],this.processedElements=[],this._parent.constructor.call(this,t,e,r,s,i)}function ITextElement(t,e,r,s){}function SVGTextElement(t,e,r,s,i){this.textSpans=[],this.renderType="svg",this._parent.constructor.call(this,t,e,r,s,i)}function SVGTintFilter(t,e){this.filterManager=e;var r=document.createElementNS(svgNS,"feColorMatrix");if(r.setAttribute("type","matrix"),r.setAttribute("color-interpolation-filters","linearRGB"),r.setAttribute("values","0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"),r.setAttribute("result","f1"),t.appendChild(r),r=document.createElementNS(svgNS,"feColorMatrix"),r.setAttribute("type","matrix"),r.setAttribute("color-interpolation-filters","sRGB"),r.setAttribute("values","1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"),r.setAttribute("result","f2"),t.appendChild(r),this.matrixFilter=r,100!==e.effectElements[2].p.v||e.effectElements[2].p.k){var s=document.createElementNS(svgNS,"feMerge");t.appendChild(s);var i;i=document.createElementNS(svgNS,"feMergeNode"),i.setAttribute("in","SourceGraphic"),s.appendChild(i),i=document.createElementNS(svgNS,"feMergeNode"),i.setAttribute("in","f2"),s.appendChild(i)}}function SVGFillFilter(t,e){this.filterManager=e;var r=document.createElementNS(svgNS,"feColorMatrix");r.setAttribute("type","matrix"),r.setAttribute("color-interpolation-filters","sRGB"),r.setAttribute("values","1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"),t.appendChild(r),this.matrixFilter=r}function SVGStrokeEffect(t,e){this.initialized=!1,this.filterManager=e,this.elem=t,this.paths=[]}function SVGTritoneFilter(t,e){this.filterManager=e;var r=document.createElementNS(svgNS,"feColorMatrix");r.setAttribute("type","matrix"),r.setAttribute("color-interpolation-filters","linearRGB"),r.setAttribute("values","0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"),r.setAttribute("result","f1"),t.appendChild(r);var s=document.createElementNS(svgNS,"feComponentTransfer");s.setAttribute("color-interpolation-filters","sRGB"),t.appendChild(s),this.matrixFilter=s;var i=document.createElementNS(svgNS,"feFuncR");i.setAttribute("type","table"),s.appendChild(i),this.feFuncR=i;var a=document.createElementNS(svgNS,"feFuncG");a.setAttribute("type","table"),s.appendChild(a),this.feFuncG=a;var n=document.createElementNS(svgNS,"feFuncB");n.setAttribute("type","table"),s.appendChild(n),this.feFuncB=n}function SVGProLevelsFilter(t,e){this.filterManager=e;var r=this.filterManager.effectElements,s=document.createElementNS(svgNS,"feComponentTransfer");(r[9].p.k||0!==r[9].p.v||r[10].p.k||1!==r[10].p.v||r[11].p.k||1!==r[11].p.v||r[12].p.k||0!==r[12].p.v||r[13].p.k||1!==r[13].p.v)&&(this.feFuncR=this.createFeFunc("feFuncR",s)),(r[16].p.k||0!==r[16].p.v||r[17].p.k||1!==r[17].p.v||r[18].p.k||1!==r[18].p.v||r[19].p.k||0!==r[19].p.v||r[20].p.k||1!==r[20].p.v)&&(this.feFuncG=this.createFeFunc("feFuncG",s)),(r[23].p.k||0!==r[23].p.v||r[24].p.k||1!==r[24].p.v||r[25].p.k||1!==r[25].p.v||r[26].p.k||0!==r[26].p.v||r[27].p.k||1!==r[27].p.v)&&(this.feFuncB=this.createFeFunc("feFuncB",s)),(r[30].p.k||0!==r[30].p.v||r[31].p.k||1!==r[31].p.v||r[32].p.k||1!==r[32].p.v||r[33].p.k||0!==r[33].p.v||r[34].p.k||1!==r[34].p.v)&&(this.feFuncA=this.createFeFunc("feFuncA",s)),(this.feFuncR||this.feFuncG||this.feFuncB||this.feFuncA)&&(s.setAttribute("color-interpolation-filters","sRGB"),t.appendChild(s),s=document.createElementNS(svgNS,"feComponentTransfer")),(r[2].p.k||0!==r[2].p.v||r[3].p.k||1!==r[3].p.v||r[4].p.k||1!==r[4].p.v||r[5].p.k||0!==r[5].p.v||r[6].p.k||1!==r[6].p.v)&&(s.setAttribute("color-interpolation-filters","sRGB"),t.appendChild(s),this.feFuncRComposed=this.createFeFunc("feFuncR",s),this.feFuncGComposed=this.createFeFunc("feFuncG",s),this.feFuncBComposed=this.createFeFunc("feFuncB",s))}function SVGDropShadowEffect(t,e){t.setAttribute("x","-100%"),t.setAttribute("y","-100%"),t.setAttribute("width","400%"),t.setAttribute("height","400%"),this.filterManager=e;var r=document.createElementNS(svgNS,"feGaussianBlur");r.setAttribute("in","SourceAlpha"),r.setAttribute("result","drop_shadow_1"),r.setAttribute("stdDeviation","0"),this.feGaussianBlur=r,t.appendChild(r);var s=document.createElementNS(svgNS,"feOffset");s.setAttribute("dx","25"),s.setAttribute("dy","0"),s.setAttribute("in","drop_shadow_1"),s.setAttribute("result","drop_shadow_2"),this.feOffset=s,t.appendChild(s);var i=document.createElementNS(svgNS,"feFlood");i.setAttribute("flood-color","#00ff00"),i.setAttribute("flood-opacity","1"),i.setAttribute("result","drop_shadow_3"),this.feFlood=i,t.appendChild(i);var a=document.createElementNS(svgNS,"feComposite");a.setAttribute("in","drop_shadow_3"),a.setAttribute("in2","drop_shadow_2"),a.setAttribute("operator","in"),a.setAttribute("result","drop_shadow_4"),t.appendChild(a);var n=document.createElementNS(svgNS,"feMerge");t.appendChild(n);var o;o=document.createElementNS(svgNS,"feMergeNode"),n.appendChild(o),o=document.createElementNS(svgNS,"feMergeNode"),o.setAttribute("in","SourceGraphic"),this.feMergeNode=o,this.feMerge=n,this.originalNodeAdded=!1,n.appendChild(o)}function SVGMatte3Effect(t,e,r){this.initialized=!1,this.filterManager=e,this.filterElem=t,this.elem=r,r.matteElement=document.createElementNS(svgNS,"g"),r.matteElement.appendChild(r.layerElement),r.matteElement.appendChild(r.transformedElement),r.baseElement=r.matteElement}function SVGEffects(t){var e,r=t.data.ef.length,s=randomString(10),i=filtersFactory.createFilter(s),a=0;this.filters=[];var n;for(e=0;r>e;e+=1)20===t.data.ef[e].ty?(a+=1,n=new SVGTintFilter(i,t.effects.effectElements[e]),this.filters.push(n)):21===t.data.ef[e].ty?(a+=1,n=new SVGFillFilter(i,t.effects.effectElements[e]),this.filters.push(n)):22===t.data.ef[e].ty?(n=new SVGStrokeEffect(t,t.effects.effectElements[e]),this.filters.push(n)):23===t.data.ef[e].ty?(a+=1,n=new SVGTritoneFilter(i,t.effects.effectElements[e]),this.filters.push(n)):24===t.data.ef[e].ty?(a+=1,n=new SVGProLevelsFilter(i,t.effects.effectElements[e]),this.filters.push(n)):25===t.data.ef[e].ty?(a+=1,n=new SVGDropShadowEffect(i,t.effects.effectElements[e]),this.filters.push(n)):28===t.data.ef[e].ty&&(n=new SVGMatte3Effect(i,t.effects.effectElements[e],t),this.filters.push(n));a&&(t.globalData.defs.appendChild(i),t.layerElement.setAttribute("filter","url("+locationHref+"#"+s+")"))}function ICompElement(t,e,r,s,i){this._parent.constructor.call(this,t,e,r,s,i),this.layers=t.layers,this.supports3d=!0,this.completeLayers=!1,this.pendingElements=[],this.elements=this.layers?Array.apply(null,{length:this.layers.length}):[],this.data.tm&&(this.tm=PropertyFactory.getProp(this,this.data.tm,0,r.frameRate,this.dynamicProperties)),this.data.xt?(this.layerElement=document.createElementNS(svgNS,"g"),this.buildAllItems()):r.progressiveLoad||this.buildAllItems()}function IImageElement(t,e,r,s,i){this.assetData=r.getAssetData(t.refId),this._parent.constructor.call(this,t,e,r,s,i)}function ISolidElement(t,e,r,s,i){this._parent.constructor.call(this,t,e,r,s,i)}function CanvasRenderer(t,e){this.animationItem=t,this.renderConfig={clearCanvas:e&&void 0!==e.clearCanvas?e.clearCanvas:!0,context:e&&e.context||null,progressiveLoad:e&&e.progressiveLoad||!1,preserveAspectRatio:e&&e.preserveAspectRatio||"xMidYMid meet",className:e&&e.className||""},this.renderConfig.dpr=e&&e.dpr||1,this.animationItem.wrapper&&(this.renderConfig.dpr=e&&e.dpr||window.devicePixelRatio||1),this.renderedFrame=-1,this.globalData={frameNum:-1},this.contextData={saved:Array.apply(null,{length:15}),savedOp:Array.apply(null,{length:15}),cArrPos:0,cTr:new Matrix,cO:1};var r,s=15;for(r=0;s>r;r+=1)this.contextData.saved[r]=Array.apply(null,{length:16});this.elements=[],this.pendingElements=[],this.transformMat=new Matrix,this.completeLayers=!1}function HybridRenderer(t,e){this.animationItem=t,this.layers=null,this.renderedFrame=-1,this.globalData={frameNum:-1},this.renderConfig={className:e&&e.className||""},this.pendingElements=[],this.elements=[],this.threeDElements=[],this.destroyed=!1,this.camera=null,this.supports3d=!0}function CVBaseElement(t,e,r){this.globalData=r,this.data=t,this.comp=e,this.canvasContext=r.canvasContext,this.init()}function CVCompElement(t,e,r){this._parent.constructor.call(this,t,e,r);var s={};for(var i in r)r.hasOwnProperty(i)&&(s[i]=r[i]);s.renderer=this,s.compHeight=this.data.h,s.compWidth=this.data.w,this.renderConfig={clearCanvas:!0},this.contextData={saved:Array.apply(null,{length:15}),savedOp:Array.apply(null,{length:15}),cArrPos:0,cTr:new Matrix,cO:1},this.completeLayers=!1;var a,n=15;for(a=0;n>a;a+=1)this.contextData.saved[a]=Array.apply(null,{length:16});this.transformMat=new Matrix,this.parentGlobalData=this.globalData;var o=document.createElement("canvas");s.canvasContext=o.getContext("2d"),this.canvasContext=s.canvasContext,o.width=this.data.w,o.height=this.data.h,this.canvas=o,this.globalData=s,this.layers=t.layers,this.pendingElements=[],this.elements=Array.apply(null,{length:this.layers.length}),this.data.tm&&(this.tm=PropertyFactory.getProp(this,this.data.tm,0,r.frameRate,this.dynamicProperties)),(this.data.xt||!r.progressiveLoad)&&this.buildAllItems()}function CVImageElement(t,e,r){this.assetData=r.getAssetData(t.refId),this._parent.constructor.call(this,t,e,r),this.globalData.addPendingElement()}function CVMaskElement(t,e){this.data=t,this.element=e,this.dynamicProperties=[],this.masksProperties=this.data.masksProperties,this.viewData=Array.apply(null,{length:this.masksProperties.length});var r,s=this.masksProperties.length;for(r=0;s>r;r++)this.viewData[r]=ShapePropertyFactory.getShapeProp(this.element,this.masksProperties[r],3,this.dynamicProperties,null)}function CVShapeElement(t,e,r){this.shapes=[],this.shapesData=t.shapes,this.stylesList=[],this.itemsData=[],this.prevViewData=[],this.shapeModifiers=[],this.processedElements=[],this._parent.constructor.call(this,t,e,r)}function CVSolidElement(t,e,r){this._parent.constructor.call(this,t,e,r)}function CVTextElement(t,e,r){this.textSpans=[],this.yOffset=0,this.fillColorAnim=!1,this.strokeColorAnim=!1,this.strokeWidthAnim=!1,this.stroke=!1,this.fill=!1,this.justifyOffset=0,this.currentRender=null,this.renderType="canvas",this.values={fill:"rgba(0,0,0,0)",stroke:"rgba(0,0,0,0)",sWidth:0,fValue:""},this._parent.constructor.call(this,t,e,r)}function HBaseElement(t,e,r,s,i){this.globalData=r,this.comp=s,this.data=t,this.matteElement=null,this.parentContainer=e,this.layerId=i?i.layerId:"ly_"+randomString(10),this.placeholder=i,this.init()}function HSolidElement(t,e,r,s,i){this._parent.constructor.call(this,t,e,r,s,i)}function HCompElement(t,e,r,s,i){this._parent.constructor.call(this,t,e,r,s,i),this.layers=t.layers,this.supports3d=!0,this.completeLayers=!1,this.pendingElements=[],this.elements=Array.apply(null,{length:this.layers.length}),this.data.tm&&(this.tm=PropertyFactory.getProp(this,this.data.tm,0,r.frameRate,this.dynamicProperties)),this.data.hasMask&&(this.supports3d=!1),this.data.xt&&(this.layerElement=document.createElement("div")),this.buildAllItems()}function HShapeElement(t,e,r,s,i){this.shapes=[],this.shapesData=t.shapes,this.stylesList=[],this.itemsData=[],this.prevViewData=[],this.shapeModifiers=[],this.processedElements=[],this._parent.constructor.call(this,t,e,r,s,i),this.currentBBox={x:999999,y:-999999,h:0,w:0}}function HTextElement(t,e,r,s,i){this.textSpans=[],this.textPaths=[],this.currentBBox={x:999999,y:-999999,h:0,w:0},this.renderType="svg",this.isMasked=!1,this._parent.constructor.call(this,t,e,r,s,i)}function HImageElement(t,e,r,s,i){this.assetData=r.getAssetData(t.refId),this._parent.constructor.call(this,t,e,r,s,i)}function HCameraElement(t,e,r,s,i){this._parent.constructor.call(this,t,e,r,s,i);var a=PropertyFactory.getProp;if(this.pe=a(this,t.pe,0,0,this.dynamicProperties),t.ks.p.s?(this.px=a(this,t.ks.p.x,1,0,this.dynamicProperties),this.py=a(this,t.ks.p.y,1,0,this.dynamicProperties),this.pz=a(this,t.ks.p.z,1,0,this.dynamicProperties)):this.p=a(this,t.ks.p,1,0,this.dynamicProperties),t.ks.a&&(this.a=a(this,t.ks.a,1,0,this.dynamicProperties)),t.ks.or.k.length&&t.ks.or.k[0].to){var n,o=t.ks.or.k.length;for(n=0;o>n;n+=1)t.ks.or.k[n].to=null,t.ks.or.k[n].ti=null}this.or=a(this,t.ks.or,1,degToRads,this.dynamicProperties),this.or.sh=!0,this.rx=a(this,t.ks.rx,0,degToRads,this.dynamicProperties),this.ry=a(this,t.ks.ry,0,degToRads,this.dynamicProperties),this.rz=a(this,t.ks.rz,0,degToRads,this.dynamicProperties),this.mat=new Matrix}function SliderEffect(t,e,r){this.p=PropertyFactory.getProp(e,t.v,0,0,r)}function AngleEffect(t,e,r){this.p=PropertyFactory.getProp(e,t.v,0,0,r)}function ColorEffect(t,e,r){this.p=PropertyFactory.getProp(e,t.v,1,0,r)}function PointEffect(t,e,r){this.p=PropertyFactory.getProp(e,t.v,1,0,r)}function LayerIndexEffect(t,e,r){this.p=PropertyFactory.getProp(e,t.v,0,0,r)}function MaskIndexEffect(t,e,r){this.p=PropertyFactory.getProp(e,t.v,0,0,r)}function CheckboxEffect(t,e,r){this.p=PropertyFactory.getProp(e,t.v,0,0,r)}function NoValueEffect(){this.p={}}function EffectsManager(t,e,r){var s=t.ef;this.effectElements=[];var i,a,n=s.length;for(i=0;n>i;i++)a=new GroupEffect(s[i],e,r),this.effectElements.push(a)}function GroupEffect(t,e,r){this.dynamicProperties=[],this.init(t,e,this.dynamicProperties),this.dynamicProperties.length&&r.push(this)}function setLocationHref(t){locationHref=t}function play(t){animationManager.play(t)}function pause(t){animationManager.pause(t)}function togglePause(t){animationManager.togglePause(t)}function setSpeed(t,e){animationManager.setSpeed(t,e)}function setDirection(t,e){animationManager.setDirection(t,e)}function stop(t){animationManager.stop(t)}function moveFrame(t){animationManager.moveFrame(t)}function searchAnimations(){standalone===!0?animationManager.searchAnimations(animationData,standalone,renderer):animationManager.searchAnimations()}function registerAnimation(t){return animationManager.registerAnimation(t)}function resize(){animationManager.resize()}function start(){animationManager.start()}function goToAndStop(t,e,r){animationManager.goToAndStop(t,e,r)}function setSubframeRendering(t){subframeEnabled=t}function loadAnimation(t){return standalone===!0&&(t.animationData=JSON.parse(animationData)),animationManager.loadAnimation(t)}function destroy(t){return animationManager.destroy(t)}function setQuality(t){if("string"==typeof t)switch(t){case"high":defaultCurveSegments=200;break;case"medium":defaultCurveSegments=50;break;case"low":defaultCurveSegments=10}else!isNaN(t)&&t>1&&(defaultCurveSegments=t);roundValues(defaultCurveSegments>=50?!1:!0)}function inBrowser(){return"undefined"!=typeof navigator}function installPlugin(t,e){"expressions"===t&&(expressionsPlugin=e)}function getFactory(t){switch(t){case"propertyFactory":return PropertyFactory;case"shapePropertyFactory":return ShapePropertyFactory;case"matrix":return Matrix}}function checkReady(){"complete"===document.readyState&&(clearInterval(readyStateCheckInterval),searchAnimations())}function getQueryVariable(t){for(var e=queryString.split("&"),r=0;r<e.length;r++){var s=e[r].split("=");if(decodeURIComponent(s[0])==t)return decodeURIComponent(s[1])}}var svgNS="http://www.w3.org/2000/svg",locationHref="",subframeEnabled=!0,expressionsPlugin,isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),cachedColors={},bm_rounder=Math.round,bm_rnd,bm_pow=Math.pow,bm_sqrt=Math.sqrt,bm_abs=Math.abs,bm_floor=Math.floor,bm_max=Math.max,bm_min=Math.min,blitter=10,BMMath={};!function(){var t,e=Object.getOwnPropertyNames(Math),r=e.length;for(t=0;r>t;t+=1)BMMath[e[t]]=Math[e[t]]}(),BMMath.random=Math.random,BMMath.abs=function(t){var e=typeof t;if("object"===e&&t.length){var r,s=Array.apply(null,{length:t.length}),i=t.length;for(r=0;i>r;r+=1)s[r]=Math.abs(t[r]);return s}return Math.abs(t)};var defaultCurveSegments=150,degToRads=Math.PI/180,roundCorner=.5519;roundValues(!1);var rgbToHex=function(){var t,e,r=[];for(t=0;256>t;t+=1)e=t.toString(16),r[t]=1==e.length?"0"+e:e;return function(t,e,s){return 0>t&&(t=0),0>e&&(e=0),0>s&&(s=0),"#"+r[t]+r[e]+r[s]}}(),createTypedArray=function(){function t(t,e){var r,s=0,i=[];switch(t){case"int16":case"uint8c":r=1;break;default:r=1.1}for(s=0;e>s;s+=1)i.push(r);return i}function e(t,e){return"float32"===t?new Float32Array(e):"int16"===t?new Int16Array(e):"uint8c"===t?new Uint8ClampedArray(e):void 0;

}return"function"==typeof Float32Array?e:t}(),Matrix=function(){function t(){return this.props[0]=1,this.props[1]=0,this.props[2]=0,this.props[3]=0,this.props[4]=0,this.props[5]=1,this.props[6]=0,this.props[7]=0,this.props[8]=0,this.props[9]=0,this.props[10]=1,this.props[11]=0,this.props[12]=0,this.props[13]=0,this.props[14]=0,this.props[15]=1,this}function e(t){if(0===t)return this;var e=k(t),r=A(t);return this._t(e,-r,0,0,r,e,0,0,0,0,1,0,0,0,0,1)}function r(t){if(0===t)return this;var e=k(t),r=A(t);return this._t(1,0,0,0,0,e,-r,0,0,r,e,0,0,0,0,1)}function s(t){if(0===t)return this;var e=k(t),r=A(t);return this._t(e,0,r,0,0,1,0,0,-r,0,e,0,0,0,0,1)}function i(t){if(0===t)return this;var e=k(t),r=A(t);return this._t(e,-r,0,0,r,e,0,0,0,0,1,0,0,0,0,1)}function a(t,e){return this._t(1,e,t,1,0,0)}function n(t,e){return this.shear(M(t),M(e))}function o(t,e){var r=k(e),s=A(e);return this._t(r,s,0,0,-s,r,0,0,0,0,1,0,0,0,0,1)._t(1,0,0,0,M(t),1,0,0,0,0,1,0,0,0,0,1)._t(r,-s,0,0,s,r,0,0,0,0,1,0,0,0,0,1)}function h(t,e,r){return r=isNaN(r)?1:r,1==t&&1==e&&1==r?this:this._t(t,0,0,0,0,e,0,0,0,0,r,0,0,0,0,1)}function l(t,e,r,s,i,a,n,o,h,l,p,m,f,c,d,u){return this.props[0]=t,this.props[1]=e,this.props[2]=r,this.props[3]=s,this.props[4]=i,this.props[5]=a,this.props[6]=n,this.props[7]=o,this.props[8]=h,this.props[9]=l,this.props[10]=p,this.props[11]=m,this.props[12]=f,this.props[13]=c,this.props[14]=d,this.props[15]=u,this}function p(t,e,r){return r=r||0,0!==t||0!==e||0!==r?this._t(1,0,0,0,0,1,0,0,0,0,1,0,t,e,r,1):this}function m(t,e,r,s,i,a,n,o,h,l,p,m,f,c,d,u){if(1===t&&0===e&&0===r&&0===s&&0===i&&1===a&&0===n&&0===o&&0===h&&0===l&&1===p&&0===m)return(0!==f||0!==c||0!==d)&&(this.props[12]=this.props[12]*t+this.props[13]*i+this.props[14]*h+this.props[15]*f,this.props[13]=this.props[12]*e+this.props[13]*a+this.props[14]*l+this.props[15]*c,this.props[14]=this.props[12]*r+this.props[13]*n+this.props[14]*p+this.props[15]*d,this.props[15]=this.props[12]*s+this.props[13]*o+this.props[14]*m+this.props[15]*u),this._identityCalculated=!1,this;var y=this.props[0],g=this.props[1],v=this.props[2],b=this.props[3],E=this.props[4],P=this.props[5],x=this.props[6],S=this.props[7],C=this.props[8],k=this.props[9],A=this.props[10],M=this.props[11],D=this.props[12],w=this.props[13],T=this.props[14],_=this.props[15];return this.props[0]=y*t+g*i+v*h+b*f,this.props[1]=y*e+g*a+v*l+b*c,this.props[2]=y*r+g*n+v*p+b*d,this.props[3]=y*s+g*o+v*m+b*u,this.props[4]=E*t+P*i+x*h+S*f,this.props[5]=E*e+P*a+x*l+S*c,this.props[6]=E*r+P*n+x*p+S*d,this.props[7]=E*s+P*o+x*m+S*u,this.props[8]=C*t+k*i+A*h+M*f,this.props[9]=C*e+k*a+A*l+M*c,this.props[10]=C*r+k*n+A*p+M*d,this.props[11]=C*s+k*o+A*m+M*u,this.props[12]=D*t+w*i+T*h+_*f,this.props[13]=D*e+w*a+T*l+_*c,this.props[14]=D*r+w*n+T*p+_*d,this.props[15]=D*s+w*o+T*m+_*u,this._identityCalculated=!1,this}function f(){return this._identityCalculated||(this._identity=!(1!==this.props[0]||0!==this.props[1]||0!==this.props[2]||0!==this.props[3]||0!==this.props[4]||1!==this.props[5]||0!==this.props[6]||0!==this.props[7]||0!==this.props[8]||0!==this.props[9]||1!==this.props[10]||0!==this.props[11]||0!==this.props[12]||0!==this.props[13]||0!==this.props[14]||1!==this.props[15]),this._identityCalculated=!0),this._identity}function c(t){var e;for(e=0;16>e;e+=1)t.props[e]=this.props[e]}function d(t){var e;for(e=0;16>e;e+=1)this.props[e]=t[e]}function u(t,e,r){return{x:t*this.props[0]+e*this.props[4]+r*this.props[8]+this.props[12],y:t*this.props[1]+e*this.props[5]+r*this.props[9]+this.props[13],z:t*this.props[2]+e*this.props[6]+r*this.props[10]+this.props[14]}}function y(t,e,r){return t*this.props[0]+e*this.props[4]+r*this.props[8]+this.props[12]}function g(t,e,r){return t*this.props[1]+e*this.props[5]+r*this.props[9]+this.props[13]}function v(t,e,r){return t*this.props[2]+e*this.props[6]+r*this.props[10]+this.props[14]}function b(t){var e=this.props[0]*this.props[5]-this.props[1]*this.props[4],r=this.props[5]/e,s=-this.props[1]/e,i=-this.props[4]/e,a=this.props[0]/e,n=(this.props[4]*this.props[13]-this.props[5]*this.props[12])/e,o=-(this.props[0]*this.props[13]-this.props[1]*this.props[12])/e;return[t[0]*r+t[1]*i+n,t[0]*s+t[1]*a+o,0]}function E(t){var e,r=t.length,s=[];for(e=0;r>e;e+=1)s[e]=b(t[e]);return s}function P(t,e,r,s){if(s&&2===s){var i=point_pool.newPoint();return i[0]=t*this.props[0]+e*this.props[4]+r*this.props[8]+this.props[12],i[1]=t*this.props[1]+e*this.props[5]+r*this.props[9]+this.props[13],i}return[t*this.props[0]+e*this.props[4]+r*this.props[8]+this.props[12],t*this.props[1]+e*this.props[5]+r*this.props[9]+this.props[13],t*this.props[2]+e*this.props[6]+r*this.props[10]+this.props[14]]}function x(t,e){return this.isIdentity()?t+","+e:bm_rnd(t*this.props[0]+e*this.props[4]+this.props[12])+","+bm_rnd(t*this.props[1]+e*this.props[5]+this.props[13])}function S(){for(var t=0,e=this.props,r="matrix3d(",s=1e4;16>t;)r+=D(e[t]*s)/s,r+=15===t?")":",",t+=1;return r}function C(){var t=1e4,e=this.props;return"matrix("+D(e[0]*t)/t+","+D(e[1]*t)/t+","+D(e[4]*t)/t+","+D(e[5]*t)/t+","+D(e[12]*t)/t+","+D(e[13]*t)/t+")"}var k=Math.cos,A=Math.sin,M=Math.tan,D=Math.round;return function(){this.reset=t,this.rotate=e,this.rotateX=r,this.rotateY=s,this.rotateZ=i,this.skew=n,this.skewFromAxis=o,this.shear=a,this.scale=h,this.setTransform=l,this.translate=p,this.transform=m,this.applyToPoint=u,this.applyToX=y,this.applyToY=g,this.applyToZ=v,this.applyToPointArray=P,this.applyToPointStringified=x,this.toCSS=S,this.to2dCSS=C,this.clone=c,this.cloneFromProps=d,this.inversePoints=E,this.inversePoint=b,this._t=this.transform,this.isIdentity=f,this._identity=!0,this._identityCalculated=!1,this.props=createTypedArray("float32",16),this.reset()}}();!function(t,e){function r(r,l,p){var c=[];l=1==l?{entropy:!0}:l||{};var v=n(a(l.entropy?[r,h(t)]:null==r?o():r,3),c),b=new s(c),E=function(){for(var t=b.g(f),e=u,r=0;y>t;)t=(t+r)*m,e*=m,r=b.g(1);for(;t>=g;)t/=2,e/=2,r>>>=1;return(t+r)/e};return E.int32=function(){return 0|b.g(4)},E.quick=function(){return b.g(4)/4294967296},E["double"]=E,n(h(b.S),t),(l.pass||p||function(t,r,s,a){return a&&(a.S&&i(a,b),t.state=function(){return i(b,{})}),s?(e[d]=t,r):t})(E,v,"global"in l?l.global:this==e,l.state)}function s(t){var e,r=t.length,s=this,i=0,a=s.i=s.j=0,n=s.S=[];for(r||(t=[r++]);m>i;)n[i]=i++;for(i=0;m>i;i++)n[i]=n[a=v&a+t[i%r]+(e=n[i])],n[a]=e;(s.g=function(t){for(var e,r=0,i=s.i,a=s.j,n=s.S;t--;)e=n[i=v&i+1],r=r*m+n[v&(n[i]=n[a=v&a+e])+(n[a]=e)];return s.i=i,s.j=a,r})(m)}function i(t,e){return e.i=t.i,e.j=t.j,e.S=t.S.slice(),e}function a(t,e){var r,s=[],i=typeof t;if(e&&"object"==i)for(r in t)try{s.push(a(t[r],e-1))}catch(n){}return s.length?s:"string"==i?t:t+"\x00"}function n(t,e){for(var r,s=t+"",i=0;i<s.length;)e[v&i]=v&(r^=19*e[v&i])+s.charCodeAt(i++);return h(e)}function o(){try{if(l)return h(l.randomBytes(m));var e=new Uint8Array(m);return(p.crypto||p.msCrypto).getRandomValues(e),h(e)}catch(r){var s=p.navigator,i=s&&s.plugins;return[+new Date,p,i,p.screen,h(t)]}}function h(t){return String.fromCharCode.apply(0,t)}var l,p=this,m=256,f=6,c=52,d="random",u=e.pow(m,f),y=e.pow(2,c),g=2*y,v=m-1;e["seed"+d]=r,n(e.random(),t)}([],BMMath);var BezierFactory=function(){function t(t,e,r,s,i){var a=i||("bez_"+t+"_"+e+"_"+r+"_"+s).replace(/\./g,"p");if(p[a])return p[a];var n=new h([t,e,r,s]);return p[a]=n,n}function e(t,e){return 1-3*e+3*t}function r(t,e){return 3*e-6*t}function s(t){return 3*t}function i(t,i,a){return((e(i,a)*t+r(i,a))*t+s(i))*t}function a(t,i,a){return 3*e(i,a)*t*t+2*r(i,a)*t+s(i)}function n(t,e,r,s,a){var n,o,h=0;do o=e+(r-e)/2,n=i(o,s,a)-t,n>0?r=o:e=o;while(Math.abs(n)>c&&++h<d);return o}function o(t,e,r,s){for(var n=0;m>n;++n){var o=a(e,r,s);if(0===o)return e;var h=i(e,r,s)-t;e-=h/o}return e}function h(t){this._p=t,this._mSampleValues=g?new Float32Array(u):new Array(u),this._precomputed=!1,this.get=this.get.bind(this)}var l={};l.getBezierEasing=t;var p={},m=4,f=.001,c=1e-7,d=10,u=11,y=1/(u-1),g="function"==typeof Float32Array;return h.prototype={get:function(t){var e=this._p[0],r=this._p[1],s=this._p[2],a=this._p[3];return this._precomputed||this._precompute(),e===r&&s===a?t:0===t?0:1===t?1:i(this._getTForX(t),r,a)},_precompute:function(){var t=this._p[0],e=this._p[1],r=this._p[2],s=this._p[3];this._precomputed=!0,(t!==e||r!==s)&&this._calcSampleValues()},_calcSampleValues:function(){for(var t=this._p[0],e=this._p[2],r=0;u>r;++r)this._mSampleValues[r]=i(r*y,t,e)},_getTForX:function(t){for(var e=this._p[0],r=this._p[2],s=this._mSampleValues,i=0,h=1,l=u-1;h!==l&&s[h]<=t;++h)i+=y;--h;var p=(t-s[h])/(s[h+1]-s[h]),m=i+p*y,c=a(m,e,r);return c>=f?o(t,m,e,r):0===c?m:n(t,i,i+y,e,r)}},l}();!function(){for(var t=0,e=["ms","moz","webkit","o"],r=0;r<e.length&&!window.requestAnimationFrame;++r)window.requestAnimationFrame=window[e[r]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[e[r]+"CancelAnimationFrame"]||window[e[r]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(e,r){var s=(new Date).getTime(),i=Math.max(0,16-(s-t)),a=setTimeout(function(){e(s+i)},i);return t=s+i,a}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(t){clearTimeout(t)})}();var bez=bezFunction(),dataManager=dataFunctionManager(),FontManager=function(){function t(t,e){var r=document.createElement("span");r.style.fontFamily=e;var s=document.createElement("span");s.innerHTML="giItT1WQy@!-/#",r.style.position="absolute",r.style.left="-10000px",r.style.top="-10000px",r.style.fontSize="300px",r.style.fontVariant="normal",r.style.fontStyle="normal",r.style.fontWeight="normal",r.style.letterSpacing="0",r.appendChild(s),document.body.appendChild(r);var i=s.offsetWidth;return s.style.fontFamily=t+", "+e,{node:s,w:i,parent:r}}function e(){var t,r,s,i=this.fonts.length,a=i;for(t=0;i>t;t+=1)if(this.fonts[t].loaded)a-=1;else if("t"===this.fonts[t].fOrigin||2===this.fonts[t].origin){if(window.Typekit&&window.Typekit.load&&0===this.typekitLoaded){this.typekitLoaded=1;try{window.Typekit.load({async:!0,active:function(){this.typekitLoaded=2}.bind(this)})}catch(n){}}2===this.typekitLoaded&&(this.fonts[t].loaded=!0)}else"n"===this.fonts[t].fOrigin||0===this.fonts[t].origin?this.fonts[t].loaded=!0:(r=this.fonts[t].monoCase.node,s=this.fonts[t].monoCase.w,r.offsetWidth!==s?(a-=1,this.fonts[t].loaded=!0):(r=this.fonts[t].sansCase.node,s=this.fonts[t].sansCase.w,r.offsetWidth!==s&&(a-=1,this.fonts[t].loaded=!0)),this.fonts[t].loaded&&(this.fonts[t].sansCase.parent.parentNode.removeChild(this.fonts[t].sansCase.parent),this.fonts[t].monoCase.parent.parentNode.removeChild(this.fonts[t].monoCase.parent)));0!==a&&Date.now()-this.initTime<h?setTimeout(e.bind(this),20):setTimeout(function(){this.loaded=!0}.bind(this),0)}function r(t,e){var r=document.createElementNS(svgNS,"text");r.style.fontSize="100px",r.style.fontFamily=e.fFamily,r.textContent="1",e.fClass?(r.style.fontFamily="inherit",r.className=e.fClass):r.style.fontFamily=e.fFamily,t.appendChild(r);var s=document.createElement("canvas").getContext("2d");return s.font="100px "+e.fFamily,s}function s(s,i){if(!s)return void(this.loaded=!0);if(this.chars)return this.loaded=!0,void(this.fonts=s.list);var a,n=s.list,o=n.length;for(a=0;o>a;a+=1){if(n[a].loaded=!1,n[a].monoCase=t(n[a].fFamily,"monospace"),n[a].sansCase=t(n[a].fFamily,"sans-serif"),n[a].fPath){if("p"===n[a].fOrigin||3===n[a].origin){var h=document.createElement("style");h.type="text/css",h.innerHTML="@font-face {font-family: "+n[a].fFamily+"; font-style: normal; src: url('"+n[a].fPath+"');}",i.appendChild(h)}else if("g"===n[a].fOrigin||1===n[a].origin){var l=document.createElement("link");l.type="text/css",l.rel="stylesheet",l.href=n[a].fPath,i.appendChild(l)}else if("t"===n[a].fOrigin||2===n[a].origin){var p=document.createElement("script");p.setAttribute("src",n[a].fPath),i.appendChild(p)}}else n[a].loaded=!0;n[a].helper=r(i,n[a]),this.fonts.push(n[a])}e.bind(this)()}function i(t){if(t){this.chars||(this.chars=[]);var e,r,s,i=t.length,a=this.chars.length;for(e=0;i>e;e+=1){for(r=0,s=!1;a>r;)this.chars[r].style===t[e].style&&this.chars[r].fFamily===t[e].fFamily&&this.chars[r].ch===t[e].ch&&(s=!0),r+=1;s||(this.chars.push(t[e]),a+=1)}}}function a(t,e,r){for(var s=0,i=this.chars.length;i>s;){if(this.chars[s].ch===t&&this.chars[s].style===e&&this.chars[s].fFamily===r)return this.chars[s];s+=1}}function n(t,e,r){var s=this.getFontByName(e),i=s.helper;return i.measureText(t).width*r/100}function o(t){for(var e=0,r=this.fonts.length;r>e;){if(this.fonts[e].fName===t)return this.fonts[e];e+=1}return"sans-serif"}var h=5e3,l=function(){this.fonts=[],this.chars=null,this.typekitLoaded=0,this.loaded=!1,this.initTime=Date.now()};return l.prototype.addChars=i,l.prototype.addFonts=s,l.prototype.getCharData=a,l.prototype.getFontByName=o,l.prototype.measureText=n,l}(),PropertyFactory=function(){function t(t,e,r,s){var i,a=this.offsetTime;r.constructor===Array&&(i=Array.apply(null,{length:r.length}));for(var n,o,h=e,l=this.keyframes.length-1,p=!0;p;){if(n=this.keyframes[h],o=this.keyframes[h+1],h==l-1&&t>=o.t-a){n.h&&(n=o),e=0;break}if(o.t-a>t){e=h;break}l-1>h?h+=1:(e=0,p=!1)}var m,f,c,d,u,y;if(n.to){n.bezierData||bez.buildBezierData(n);var g=n.bezierData;if(t>=o.t-a||t<n.t-a){var v=t>=o.t-a?g.points.length-1:0;for(f=g.points[v].point.length,m=0;f>m;m+=1)i[m]=g.points[v].point[m];s._lastBezierData=null}else{n.__fnct?y=n.__fnct:(y=BezierFactory.getBezierEasing(n.o.x,n.o.y,n.i.x,n.i.y,n.n).get,n.__fnct=y),c=y((t-(n.t-a))/(o.t-a-(n.t-a)));var b,E=g.segmentLength*c,P=s.lastFrame<t&&s._lastBezierData===g?s._lastAddedLength:0;for(u=s.lastFrame<t&&s._lastBezierData===g?s._lastPoint:0,p=!0,d=g.points.length;p;){if(P+=g.points[u].partialLength,0===E||0===c||u==g.points.length-1){for(f=g.points[u].point.length,m=0;f>m;m+=1)i[m]=g.points[u].point[m];break}if(E>=P&&E<P+g.points[u+1].partialLength){for(b=(E-P)/g.points[u+1].partialLength,f=g.points[u].point.length,m=0;f>m;m+=1)i[m]=g.points[u].point[m]+(g.points[u+1].point[m]-g.points[u].point[m])*b;break}d-1>u?u+=1:p=!1}s._lastPoint=u,s._lastAddedLength=P-g.points[u].partialLength,s._lastBezierData=g}}else{var x,S,C,k,A;for(l=n.s.length,h=0;l>h;h+=1){if(1!==n.h&&(t>=o.t-a?c=1:t<n.t-a?c=0:(n.o.x.constructor===Array?(n.__fnct||(n.__fnct=[]),n.__fnct[h]?y=n.__fnct[h]:(x=n.o.x[h]||n.o.x[0],S=n.o.y[h]||n.o.y[0],C=n.i.x[h]||n.i.x[0],k=n.i.y[h]||n.i.y[0],y=BezierFactory.getBezierEasing(x,S,C,k).get,n.__fnct[h]=y)):n.__fnct?y=n.__fnct:(x=n.o.x,S=n.o.y,C=n.i.x,k=n.i.y,y=BezierFactory.getBezierEasing(x,S,C,k).get,n.__fnct=y),c=y((t-(n.t-a))/(o.t-a-(n.t-a))))),this.sh&&1!==n.h){var M=n.s[h],D=n.e[h];-180>M-D?M+=360:M-D>180&&(M-=360),A=M+(D-M)*c}else A=1===n.h?n.s[h]:n.s[h]+(n.e[h]-n.s[h])*c;1===l?i=A:i[h]=A}}return{value:i,iterationIndex:e}}function e(){if(this.elem.globalData.frameId!==this.frameId){this.mdf=!1;var t=this.comp.renderedFrame-this.offsetTime,e=this.keyframes[0].t-this.offsetTime,r=this.keyframes[this.keyframes.length-1].t-this.offsetTime;if(!(t===this._caching.lastFrame||this._caching.lastFrame!==h&&(this._caching.lastFrame>=r&&t>=r||this._caching.lastFrame<e&&e>t))){var s=this._caching.lastFrame<t?this._caching.lastIndex:0,i=this.interpolateValue(t,s,this.pv,this._caching);if(this._caching.lastIndex=i.iterationIndex,this.pv.constructor===Array)for(s=0;s<this.v.length;)this.pv[s]=i.value[s],this.v[s]=this.mult?this.pv[s]*this.mult:this.pv[s],this.lastPValue[s]!==this.pv[s]&&(this.mdf=!0,this.lastPValue[s]=this.pv[s]),s+=1;else this.pv=i.value,this.v=this.mult?this.pv*this.mult:this.pv,this.lastPValue!=this.pv&&(this.mdf=!0,this.lastPValue=this.pv)}this._caching.lastFrame=t,this.frameId=this.elem.globalData.frameId}}function r(){}function s(t,e,s){this.mult=s,this.v=s?e.k*s:e.k,this.pv=e.k,this.mdf=!1,this.comp=t.comp,this.k=!1,this.kf=!1,this.vel=0,this.getValue=r}function i(t,e,s){this.mult=s,this.data=e,this.mdf=!1,this.comp=t.comp,this.k=!1,this.kf=!1,this.frameId=-1,this.v=Array.apply(null,{length:e.k.length}),this.pv=Array.apply(null,{length:e.k.length}),this.lastValue=Array.apply(null,{length:e.k.length});var i=Array.apply(null,{length:e.k.length});this.vel=i.map(function(){return 0});var a,n=e.k.length;for(a=0;n>a;a+=1)this.v[a]=s?e.k[a]*s:e.k[a],this.pv[a]=e.k[a];this.getValue=r}function a(r,s,i){this.keyframes=s.k,this.offsetTime=r.data.st,this.lastValue=-99999,this.lastPValue=-99999,this.frameId=-1,this._caching={lastFrame:h,lastIndex:0},this.k=!0,this.kf=!0,this.data=s,this.mult=i,this.elem=r,this.comp=r.comp,this.v=i?s.k[0].s[0]*i:s.k[0].s[0],this.pv=s.k[0].s[0],this.getValue=e,this.interpolateValue=t}function n(r,s,i){var a,n,o,l,p,m=s.k.length;for(a=0;m-1>a;a+=1)s.k[a].to&&s.k[a].s&&s.k[a].e&&(n=s.k[a].s,o=s.k[a].e,l=s.k[a].to,p=s.k[a].ti,(2===n.length&&(n[0]!==o[0]||n[1]!==o[1])&&bez.pointOnLine2D(n[0],n[1],o[0],o[1],n[0]+l[0],n[1]+l[1])&&bez.pointOnLine2D(n[0],n[1],o[0],o[1],o[0]+p[0],o[1]+p[1])||3===n.length&&(n[0]!==o[0]||n[1]!==o[1]||n[2]!==o[2])&&bez.pointOnLine3D(n[0],n[1],n[2],o[0],o[1],o[2],n[0]+l[0],n[1]+l[1],n[2]+l[2])&&bez.pointOnLine3D(n[0],n[1],n[2],o[0],o[1],o[2],o[0]+p[0],o[1]+p[1],o[2]+p[2]))&&(s.k[a].to=null,s.k[a].ti=null));this.keyframes=s.k,this.offsetTime=r.data.st,this.k=!0,this.kf=!0,this.mult=i,this.elem=r,this.comp=r.comp,this._caching={lastFrame:h,lastIndex:0},this.getValue=e,this.interpolateValue=t,this.frameId=-1,this.v=Array.apply(null,{length:s.k[0].s.length}),this.pv=Array.apply(null,{length:s.k[0].s.length}),this.lastValue=Array.apply(null,{length:s.k[0].s.length}),this.lastPValue=Array.apply(null,{length:s.k[0].s.length})}function o(t,e,r,o,h){var l;if(0===e.a)l=0===r?new s(t,e,o):new i(t,e,o);else if(1===e.a)l=0===r?new a(t,e,o):new n(t,e,o);else if(e.k.length)if("number"==typeof e.k[0])l=new i(t,e,o);else switch(r){case 0:l=new a(t,e,o);break;case 1:l=new n(t,e,o)}else l=new s(t,e,o);return l.k&&h.push(l),l}var h=-999999,l={getProp:o};return l}(),TransformPropertyFactory=function(){function t(){return this.p?ExpressionValue(this.p):[this.px.v,this.py.v,this.pz?this.pz.v:0]}function e(){return ExpressionValue(this.px)}function r(){return ExpressionValue(this.py)}function s(){return ExpressionValue(this.a)}function i(){return ExpressionValue(this.or)}function a(){return this.r?ExpressionValue(this.r,1/degToRads):ExpressionValue(this.rz,1/degToRads)}function n(){return ExpressionValue(this.s,100)}function o(){return ExpressionValue(this.o,100)}function h(){return ExpressionValue(this.sk)}function l(){return ExpressionValue(this.sa)}function p(t){var e,r=this.dynamicProperties.length;for(e=0;r>e;e+=1)this.dynamicProperties[e].getValue(),this.dynamicProperties[e].mdf&&(this.mdf=!0);this.a&&t.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]),this.s&&t.scale(this.s.v[0],this.s.v[1],this.s.v[2]),this.r?t.rotate(-this.r.v):t.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]),this.data.p.s?this.data.p.z?t.translate(this.px.v,this.py.v,-this.pz.v):t.translate(this.px.v,this.py.v,0):t.translate(this.p.v[0],this.p.v[1],-this.p.v[2])}function m(){if(this.elem.globalData.frameId!==this.frameId){this.mdf=!1;var t,e=this.dynamicProperties.length;for(t=0;e>t;t+=1)this.dynamicProperties[t].getValue(),this.dynamicProperties[t].mdf&&(this.mdf=!0);if(this.mdf){if(this.v.reset(),this.a&&this.v.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]),this.s&&this.v.scale(this.s.v[0],this.s.v[1],this.s.v[2]),this.sk&&this.v.skewFromAxis(-this.sk.v,this.sa.v),this.r?this.v.rotate(-this.r.v):this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]),this.autoOriented&&this.p.keyframes&&this.p.getValueAtTime){var r,s;this.p._caching.lastFrame+this.p.offsetTime<=this.p.keyframes[0].t?(r=this.p.getValueAtTime((this.p.keyframes[0].t+.01)/this.elem.globalData.frameRate,0),s=this.p.getValueAtTime(this.p.keyframes[0].t/this.elem.globalData.frameRate,0)):this.p._caching.lastFrame+this.p.offsetTime>=this.p.keyframes[this.p.keyframes.length-1].t?(r=this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length-1].t/this.elem.globalData.frameRate,0),s=this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length-1].t-.01)/this.elem.globalData.frameRate,0)):(r=this.p.pv,s=this.p.getValueAtTime((this.p._caching.lastFrame+this.p.offsetTime-.01)/this.elem.globalData.frameRate,this.p.offsetTime)),this.v.rotate(-Math.atan2(r[1]-s[1],r[0]-s[0]))}this.data.p.s?this.data.p.z?this.v.translate(this.px.v,this.py.v,-this.pz.v):this.v.translate(this.px.v,this.py.v,0):this.v.translate(this.p.v[0],this.p.v[1],-this.p.v[2])}this.frameId=this.elem.globalData.frameId}}function f(){this.inverted=!0,this.iv=new Matrix,this.k||(this.data.p.s?this.iv.translate(this.px.v,this.py.v,-this.pz.v):this.iv.translate(this.p.v[0],this.p.v[1],-this.p.v[2]),this.r?this.iv.rotate(-this.r.v):this.iv.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v),this.s&&this.iv.scale(this.s.v[0],this.s.v[1],1),this.a&&this.iv.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]))}function c(){}function d(p,m,f){this.elem=p,this.frameId=-1,this.type="transform",this.dynamicProperties=[],this.mdf=!1,this.data=m,this.v=new Matrix,m.p.s?(this.px=PropertyFactory.getProp(p,m.p.x,0,0,this.dynamicProperties),this.py=PropertyFactory.getProp(p,m.p.y,0,0,this.dynamicProperties),m.p.z&&(this.pz=PropertyFactory.getProp(p,m.p.z,0,0,this.dynamicProperties))):this.p=PropertyFactory.getProp(p,m.p,1,0,this.dynamicProperties),m.r?this.r=PropertyFactory.getProp(p,m.r,0,degToRads,this.dynamicProperties):m.rx&&(this.rx=PropertyFactory.getProp(p,m.rx,0,degToRads,this.dynamicProperties),this.ry=PropertyFactory.getProp(p,m.ry,0,degToRads,this.dynamicProperties),this.rz=PropertyFactory.getProp(p,m.rz,0,degToRads,this.dynamicProperties),this.or=PropertyFactory.getProp(p,m.or,1,degToRads,this.dynamicProperties),this.or.sh=!0),m.sk&&(this.sk=PropertyFactory.getProp(p,m.sk,0,degToRads,this.dynamicProperties),this.sa=PropertyFactory.getProp(p,m.sa,0,degToRads,this.dynamicProperties)),m.a&&(this.a=PropertyFactory.getProp(p,m.a,1,0,this.dynamicProperties)),m.s&&(this.s=PropertyFactory.getProp(p,m.s,1,.01,this.dynamicProperties)),this.o=m.o?PropertyFactory.getProp(p,m.o,0,.01,this.dynamicProperties):{mdf:!1,v:1},this.dynamicProperties.length?f.push(this):(this.a&&this.v.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]),this.s&&this.v.scale(this.s.v[0],this.s.v[1],this.s.v[2]),this.sk&&this.v.skewFromAxis(-this.sk.v,this.sa.v),this.r?this.v.rotate(-this.r.v):this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]),this.data.p.s?m.p.z?this.v.translate(this.px.v,this.py.v,-this.pz.v):this.v.translate(this.px.v,this.py.v,0):this.v.translate(this.p.v[0],this.p.v[1],-this.p.v[2])),Object.defineProperty(this,"position",{get:t}),Object.defineProperty(this,"xPosition",{get:e}),Object.defineProperty(this,"yPosition",{get:r}),Object.defineProperty(this,"orientation",{get:i}),Object.defineProperty(this,"anchorPoint",{get:s}),Object.defineProperty(this,"rotation",{get:a}),Object.defineProperty(this,"scale",{get:n}),Object.defineProperty(this,"opacity",{get:o}),Object.defineProperty(this,"skew",{get:h}),Object.defineProperty(this,"skewAxis",{get:l})}function u(t,e,r){return new d(t,e,r)}return d.prototype.applyToMatrix=p,d.prototype.getValue=m,d.prototype.setInverted=f,d.prototype.autoOrient=c,{getTransformProperty:u}}();ShapePath.prototype.setPathData=function(t,e){this.c=t,this.setLength(e);for(var r=0;e>r;)this.v[r]=point_pool.newPoint(),this.o[r]=point_pool.newPoint(),this.i[r]=point_pool.newPoint(),r+=1},ShapePath.prototype.setLength=function(t){for(;this._maxLength<t;)this.doubleArrayLength();this._length=t},ShapePath.prototype.doubleArrayLength=function(){this.v=this.v.concat(Array.apply(null,{length:this._maxLength})),this.i=this.i.concat(Array.apply(null,{length:this._maxLength})),this.o=this.o.concat(Array.apply(null,{length:this._maxLength})),this._maxLength*=2},ShapePath.prototype.setXYAt=function(t,e,r,s,i){var a;switch(this._length=Math.max(this._length,s+1),this._length>=this._maxLength&&this.doubleArrayLength(),r){case"v":a=this.v;break;case"i":a=this.i;break;case"o":a=this.o}(!a[s]||a[s]&&!i)&&(a[s]=point_pool.newPoint()),a[s][0]=t,a[s][1]=e},ShapePath.prototype.setTripleAt=function(t,e,r,s,i,a,n,o){this.setXYAt(t,e,"v",n,o),this.setXYAt(r,s,"o",n,o),this.setXYAt(i,a,"i",n,o)},ShapePath.prototype.reverse=function(){var t=new ShapePath;t.setPathData(this.c,this._length);var e=this.v,r=this.o,s=this.i,a=0;this.c&&(t.setTripleAt(e[0][0],e[0][1],s[0][0],s[0][1],r[0][0],r[0][1],0,!1),a=1);var n=this._length-1,o=this._length;for(i=a;i<o;i+=1)t.setTripleAt(e[n][0],e[n][1],s[n][0],s[n][1],r[n][0],r[n][1],i,!1),n-=1;return t};var ShapePropertyFactory=function(){function t(t,e,r,s){var i,a,n;if(t<this.keyframes[0].t-this.offsetTime)i=this.keyframes[0].s[0],n=!0,e=0;else if(t>=this.keyframes[this.keyframes.length-1].t-this.offsetTime)i=1===this.keyframes[this.keyframes.length-2].h?this.keyframes[this.keyframes.length-1].s[0]:this.keyframes[this.keyframes.length-2].e[0],n=!0;else{for(var o,h,l,p,m,f,c=e,d=this.keyframes.length-1,u=!0;u&&(o=this.keyframes[c],h=this.keyframes[c+1],!(h.t-this.offsetTime>t));)d-1>c?c+=1:u=!1;n=1===o.h,e=c;var y;if(!n){if(t>=h.t-this.offsetTime)y=1;else if(t<o.t-this.offsetTime)y=0;else{var g;o.__fnct?g=o.__fnct:(g=BezierFactory.getBezierEasing(o.o.x,o.o.y,o.i.x,o.i.y).get,o.__fnct=g),y=g((t-(o.t-this.offsetTime))/(h.t-this.offsetTime-(o.t-this.offsetTime)))}a=o.e[0]}i=o.s[0]}p=r._length,f=i.i[0].length;var v,b=!1;for(l=0;p>l;l+=1)for(m=0;f>m;m+=1)n?(v=i.i[l][m],r.i[l][m]!==v&&(r.i[l][m]=v,s&&(this.pv.i[l][m]=v),b=!0),v=i.o[l][m],r.o[l][m]!==v&&(r.o[l][m]=v,s&&(this.pv.o[l][m]=v),b=!0),v=i.v[l][m],r.v[l][m]!==v&&(r.v[l][m]=v,s&&(this.pv.v[l][m]=v),b=!0)):(v=i.i[l][m]+(a.i[l][m]-i.i[l][m])*y,r.i[l][m]!==v&&(r.i[l][m]=v,s&&(this.pv.i[l][m]=v),b=!0),v=i.o[l][m]+(a.o[l][m]-i.o[l][m])*y,r.o[l][m]!==v&&(r.o[l][m]=v,s&&(this.pv.o[l][m]=v),b=!0),v=i.v[l][m]+(a.v[l][m]-i.v[l][m])*y,r.v[l][m]!==v&&(r.v[l][m]=v,s&&(this.pv.v[l][m]=v),b=!0));return b&&(r.c=i.c),{iterationIndex:e,hasModified:b}}function e(){if(this.elem.globalData.frameId!==this.frameId){this.mdf=!1;var t=this.comp.renderedFrame-this.offsetTime,e=this.keyframes[0].t-this.offsetTime,r=this.keyframes[this.keyframes.length-1].t-this.offsetTime;if(this.lastFrame===l||!(this.lastFrame<e&&e>t||this.lastFrame>r&&t>r)){var s=this.lastFrame<t?this._lastIndex:0,i=this.interpolateShape(t,s,this.v,!0);this._lastIndex=i.iterationIndex,this.mdf=i.hasModified,i.hasModified&&(this.paths=this.localShapeCollection)}this.lastFrame=t,this.frameId=this.elem.globalData.frameId}}function r(){return this.v}function s(){this.paths=this.localShapeCollection,this.k||(this.mdf=!1)}function i(t,e,r){this.__shapeObject=1,this.comp=t.comp,this.k=!1,this.mdf=!1;var i=3===r?e.pt.k:e.ks.k;this.v=shape_pool.clone(i),this.pv=shape_pool.clone(this.v),this.localShapeCollection=shapeCollection_pool.newShapeCollection(),this.paths=this.localShapeCollection,this.paths.addShape(this.v),this.reset=s}function a(t,e,r){this.__shapeObject=1,this.comp=t.comp,this.elem=t,this.offsetTime=t.data.st,this._lastIndex=0,this.keyframes=3===r?e.pt.k:e.ks.k,this.k=!0,this.kf=!0;{var i=this.keyframes[0].s[0].i.length;this.keyframes[0].s[0].i[0].length}this.v=shape_pool.newShape(),this.v.setPathData(this.keyframes[0].s[0].c,i),this.pv=shape_pool.clone(this.v),this.localShapeCollection=shapeCollection_pool.newShapeCollection(),this.paths=this.localShapeCollection,this.paths.addShape(this.v),this.lastFrame=l,this.reset=s}function n(t,e,r,s){var n;if(3===r||4===r){var o=3===r?e.pt:e.ks,h=o.k;n=1===o.a||h.length?new a(t,e,r):new i(t,e,r)}else 5===r?n=new f(t,e):6===r?n=new p(t,e):7===r&&(n=new m(t,e));return n.k&&s.push(n),n}function o(){return i}function h(){return a}var l=-999999;i.prototype.interpolateShape=t,i.prototype.getValue=r,a.prototype.getValue=e,a.prototype.interpolateShape=t;var p=function(){function t(){var t=this.p.v[0],e=this.p.v[1],s=this.s.v[0]/2,i=this.s.v[1]/2;3!==this.d?(this.v.v[0][0]=t,this.v.v[0][1]=e-i,this.v.v[1][0]=t+s,this.v.v[1][1]=e,this.v.v[2][0]=t,this.v.v[2][1]=e+i,this.v.v[3][0]=t-s,this.v.v[3][1]=e,this.v.i[0][0]=t-s*r,this.v.i[0][1]=e-i,this.v.i[1][0]=t+s,this.v.i[1][1]=e-i*r,this.v.i[2][0]=t+s*r,this.v.i[2][1]=e+i,this.v.i[3][0]=t-s,this.v.i[3][1]=e+i*r,this.v.o[0][0]=t+s*r,this.v.o[0][1]=e-i,this.v.o[1][0]=t+s,this.v.o[1][1]=e+i*r,this.v.o[2][0]=t-s*r,this.v.o[2][1]=e+i,this.v.o[3][0]=t-s,this.v.o[3][1]=e-i*r):(this.v.v[0][0]=t,this.v.v[0][1]=e-i,this.v.v[1][0]=t-s,this.v.v[1][1]=e,this.v.v[2][0]=t,this.v.v[2][1]=e+i,this.v.v[3][0]=t+s,this.v.v[3][1]=e,this.v.i[0][0]=t+s*r,this.v.i[0][1]=e-i,this.v.i[1][0]=t-s,this.v.i[1][1]=e-i*r,this.v.i[2][0]=t-s*r,this.v.i[2][1]=e+i,this.v.i[3][0]=t+s,this.v.i[3][1]=e+i*r,this.v.o[0][0]=t-s*r,this.v.o[0][1]=e-i,this.v.o[1][0]=t-s,this.v.o[1][1]=e+i*r,this.v.o[2][0]=t+s*r,this.v.o[2][1]=e+i,this.v.o[3][0]=t+s,this.v.o[3][1]=e-i*r)}function e(t){var e,r=this.dynamicProperties.length;if(this.elem.globalData.frameId!==this.frameId){for(this.mdf=!1,this.frameId=this.elem.globalData.frameId,e=0;r>e;e+=1)this.dynamicProperties[e].getValue(t),this.dynamicProperties[e].mdf&&(this.mdf=!0);this.mdf&&this.convertEllToPath()}}var r=roundCorner;return function(r,i){this.v=shape_pool.newShape(),this.v.setPathData(!0,4),this.localShapeCollection=shapeCollection_pool.newShapeCollection(),this.paths=this.localShapeCollection,this.localShapeCollection.addShape(this.v),this.d=i.d,this.dynamicProperties=[],this.elem=r,this.comp=r.comp,this.frameId=-1,this.mdf=!1,this.getValue=e,this.convertEllToPath=t,this.reset=s,this.p=PropertyFactory.getProp(r,i.p,1,0,this.dynamicProperties),this.s=PropertyFactory.getProp(r,i.s,1,0,this.dynamicProperties),this.dynamicProperties.length?this.k=!0:this.convertEllToPath()}}(),m=function(){function t(){var t,e=Math.floor(this.pt.v),r=2*Math.PI/e,s=this.or.v,i=this.os.v,a=2*Math.PI*s/(4*e),n=-Math.PI/2,o=3===this.data.d?-1:1;for(n+=this.r.v,this.v._length=0,t=0;e>t;t+=1){var h=s*Math.cos(n),l=s*Math.sin(n),p=0===h&&0===l?0:l/Math.sqrt(h*h+l*l),m=0===h&&0===l?0:-h/Math.sqrt(h*h+l*l);h+=+this.p.v[0],l+=+this.p.v[1],this.v.setTripleAt(h,l,h-p*a*i*o,l-m*a*i*o,h+p*a*i*o,l+m*a*i*o,t,!0),n+=r*o}this.paths.length=0,this.paths[0]=this.v}function e(){var t,e,r,s,i=2*Math.floor(this.pt.v),a=2*Math.PI/i,n=!0,o=this.or.v,h=this.ir.v,l=this.os.v,p=this.is.v,m=2*Math.PI*o/(2*i),f=2*Math.PI*h/(2*i),c=-Math.PI/2;c+=this.r.v;var d=3===this.data.d?-1:1;for(this.v._length=0,t=0;i>t;t+=1){e=n?o:h,r=n?l:p,s=n?m:f;var u=e*Math.cos(c),y=e*Math.sin(c),g=0===u&&0===y?0:y/Math.sqrt(u*u+y*y),v=0===u&&0===y?0:-u/Math.sqrt(u*u+y*y);u+=+this.p.v[0],y+=+this.p.v[1],this.v.setTripleAt(u,y,u-g*s*r*d,y-v*s*r*d,u+g*s*r*d,y+v*s*r*d,t,!0),n=!n,c+=a*d}}function r(){if(this.elem.globalData.frameId!==this.frameId){this.mdf=!1,this.frameId=this.elem.globalData.frameId;var t,e=this.dynamicProperties.length;for(t=0;e>t;t+=1)this.dynamicProperties[t].getValue(),this.dynamicProperties[t].mdf&&(this.mdf=!0);this.mdf&&this.convertToPath()}}return function(i,a){this.v=shape_pool.newShape(),this.v.setPathData(!0,0),this.elem=i,this.comp=i.comp,this.data=a,this.frameId=-1,this.d=a.d,this.dynamicProperties=[],this.mdf=!1,this.getValue=r,this.reset=s,1===a.sy?(this.ir=PropertyFactory.getProp(i,a.ir,0,0,this.dynamicProperties),this.is=PropertyFactory.getProp(i,a.is,0,.01,this.dynamicProperties),this.convertToPath=e):this.convertToPath=t,this.pt=PropertyFactory.getProp(i,a.pt,0,0,this.dynamicProperties),this.p=PropertyFactory.getProp(i,a.p,1,0,this.dynamicProperties),this.r=PropertyFactory.getProp(i,a.r,0,degToRads,this.dynamicProperties),this.or=PropertyFactory.getProp(i,a.or,0,0,this.dynamicProperties),this.os=PropertyFactory.getProp(i,a.os,0,.01,this.dynamicProperties),this.localShapeCollection=shapeCollection_pool.newShapeCollection(),
this.localShapeCollection.addShape(this.v),this.paths=this.localShapeCollection,this.dynamicProperties.length?this.k=!0:this.convertToPath()}}(),f=function(){function t(t){if(this.elem.globalData.frameId!==this.frameId){this.mdf=!1,this.frameId=this.elem.globalData.frameId;var e,r=this.dynamicProperties.length;for(e=0;r>e;e+=1)this.dynamicProperties[e].getValue(t),this.dynamicProperties[e].mdf&&(this.mdf=!0);this.mdf&&this.convertRectToPath()}}function e(){var t=this.p.v[0],e=this.p.v[1],r=this.s.v[0]/2,s=this.s.v[1]/2,i=bm_min(r,s,this.r.v),a=i*(1-roundCorner);this.v._length=0,2===this.d||1===this.d?(this.v.setTripleAt(t+r,e-s+i,t+r,e-s+i,t+r,e-s+a,0,!0),this.v.setTripleAt(t+r,e+s-i,t+r,e+s-a,t+r,e+s-i,1,!0),0!==i?(this.v.setTripleAt(t+r-i,e+s,t+r-i,e+s,t+r-a,e+s,2,!0),this.v.setTripleAt(t-r+i,e+s,t-r+a,e+s,t-r+i,e+s,3,!0),this.v.setTripleAt(t-r,e+s-i,t-r,e+s-i,t-r,e+s-a,4,!0),this.v.setTripleAt(t-r,e-s+i,t-r,e-s+a,t-r,e-s+i,5,!0),this.v.setTripleAt(t-r+i,e-s,t-r+i,e-s,t-r+a,e-s,6,!0),this.v.setTripleAt(t+r-i,e-s,t+r-a,e-s,t+r-i,e-s,7,!0)):(this.v.setTripleAt(t-r,e+s,t-r+a,e+s,t-r,e+s,2),this.v.setTripleAt(t-r,e-s,t-r,e-s+a,t-r,e-s,3))):(this.v.setTripleAt(t+r,e-s+i,t+r,e-s+a,t+r,e-s+i,0,!0),0!==i?(this.v.setTripleAt(t+r-i,e-s,t+r-i,e-s,t+r-a,e-s,1,!0),this.v.setTripleAt(t-r+i,e-s,t-r+a,e-s,t-r+i,e-s,2,!0),this.v.setTripleAt(t-r,e-s+i,t-r,e-s+i,t-r,e-s+a,3,!0),this.v.setTripleAt(t-r,e+s-i,t-r,e+s-a,t-r,e+s-i,4,!0),this.v.setTripleAt(t-r+i,e+s,t-r+i,e+s,t-r+a,e+s,5,!0),this.v.setTripleAt(t+r-i,e+s,t+r-a,e+s,t+r-i,e+s,6,!0),this.v.setTripleAt(t+r,e+s-i,t+r,e+s-i,t+r,e+s-a,7,!0)):(this.v.setTripleAt(t-r,e-s,t-r+a,e-s,t-r,e-s,1,!0),this.v.setTripleAt(t-r,e+s,t-r,e+s-a,t-r,e+s,2,!0),this.v.setTripleAt(t+r,e+s,t+r-a,e+s,t+r,e+s,3,!0)))}return function(r,i){this.v=shape_pool.newShape(),this.v.c=!0,this.localShapeCollection=shapeCollection_pool.newShapeCollection(),this.localShapeCollection.addShape(this.v),this.paths=this.localShapeCollection,this.elem=r,this.comp=r.comp,this.frameId=-1,this.d=i.d,this.dynamicProperties=[],this.mdf=!1,this.getValue=t,this.convertRectToPath=e,this.reset=s,this.p=PropertyFactory.getProp(r,i.p,1,0,this.dynamicProperties),this.s=PropertyFactory.getProp(r,i.s,1,0,this.dynamicProperties),this.r=PropertyFactory.getProp(r,i.r,0,0,this.dynamicProperties),this.dynamicProperties.length?this.k=!0:this.convertRectToPath()}}(),c={};return c.getShapeProp=n,c.getConstructorFunction=o,c.getKeyframedConstructorFunction=h,c}(),ShapeModifiers=function(){function t(t,e){s[t]||(s[t]=e)}function e(t,e,r,i){return new s[t](e,r,i)}var r={},s={};return r.registerModifier=t,r.getModifier=e,r}();ShapeModifier.prototype.initModifierProperties=function(){},ShapeModifier.prototype.addShapeToModifier=function(){},ShapeModifier.prototype.addShape=function(t){this.closed||(this.shapes.push({shape:t.sh,data:t,localShapeCollection:shapeCollection_pool.newShapeCollection()}),this.addShapeToModifier(t.sh))},ShapeModifier.prototype.init=function(t,e,r){this.elem=t,this.frameId=-1,this.shapes=[],this.dynamicProperties=[],this.mdf=!1,this.closed=!1,this.k=!1,this.comp=t.comp,this.initModifierProperties(t,e),this.dynamicProperties.length?(this.k=!0,r.push(this)):this.getValue(!0)},extendPrototype(ShapeModifier,TrimModifier),TrimModifier.prototype.processKeys=function(t){if(this.elem.globalData.frameId!==this.frameId||t){this.mdf=t?!0:!1,this.frameId=this.elem.globalData.frameId;var e,r=this.dynamicProperties.length;for(e=0;r>e;e+=1)this.dynamicProperties[e].getValue(),this.dynamicProperties[e].mdf&&(this.mdf=!0);if(this.mdf||t){var s=this.o.v%360/360;0>s&&(s+=1);var i=this.s.v+s,a=this.e.v+s;if(i>a){var n=i;i=a,a=n}this.sValue=i,this.eValue=a,this.oValue=s}}},TrimModifier.prototype.initModifierProperties=function(t,e){this.sValue=0,this.eValue=0,this.oValue=0,this.getValue=this.processKeys,this.s=PropertyFactory.getProp(t,e.s,0,.01,this.dynamicProperties),this.e=PropertyFactory.getProp(t,e.e,0,.01,this.dynamicProperties),this.o=PropertyFactory.getProp(t,e.o,0,0,this.dynamicProperties),this.m=e.m,this.dynamicProperties.length||this.getValue(!0)},TrimModifier.prototype.calculateShapeEdges=function(t,e,r,s,i){var a=[];1>=e?a.push({s:t,e:e}):t>=1?a.push({s:t-1,e:e-1}):(a.push({s:t,e:1}),a.push({s:0,e:e-1}));var n,o,h=[],l=a.length;for(n=0;l>n;n+=1)if(o=a[n],o.e*i<s||o.s*i>s+r);else{var p,m;p=o.s*i<=s?0:(o.s*i-s)/r,m=o.e*i>=s+r?1:(o.e*i-s)/r,h.push([p,m])}return h.length||h.push([0,0]),h},TrimModifier.prototype.processShapes=function(t){var e,r,s,i,a,n,o,h=this.shapes.length,l=this.sValue,p=this.eValue,m=0;if(p===l)for(r=0;h>r;r+=1)this.shapes[r].localShapeCollection.releaseShapes(),this.shapes[r].shape.mdf=!0,this.shapes[r].shape.paths=this.shapes[r].localShapeCollection;else if(1===p&&0===l||0===p&&1===l){if(this.mdf)for(r=0;h>r;r+=1)this.shapes[r].shape.mdf=!0}else{var f,c,d=[];for(r=0;h>r;r+=1)if(f=this.shapes[r],f.shape.mdf||this.mdf||t||2===this.m){if(e=f.shape.paths,i=e._length,o=0,!f.shape.mdf&&f.pathsData)o=f.totalShapeLength;else{for(a=[],s=0;i>s;s+=1)n=bez.getSegmentsLength(e.shapes[s]),a.push(n),o+=n.totalLength;f.totalShapeLength=o,f.pathsData=a}m+=o,f.shape.mdf=!0}else f.shape.paths=f.localShapeCollection;var s,i,u=l,y=p,g=0;for(r=h-1;r>=0;r-=1)if(f=this.shapes[r],f.shape.mdf){if(c=f.localShapeCollection,c.releaseShapes(),2===this.m&&h>1){var v=this.calculateShapeEdges(l,p,f.totalShapeLength,g,m);g+=f.totalShapeLength}else v=[[u,y]];for(i=v.length,s=0;i>s;s+=1){u=v[s][0],y=v[s][1],d.length=0,1>=y?d.push({s:f.totalShapeLength*u,e:f.totalShapeLength*y}):u>=1?d.push({s:f.totalShapeLength*(u-1),e:f.totalShapeLength*(y-1)}):(d.push({s:f.totalShapeLength*u,e:f.totalShapeLength}),d.push({s:0,e:f.totalShapeLength*(y-1)}));var b=this.addShapes(f,d[0]);if(d[0].s!==d[0].e){if(d.length>1)if(f.shape.v.c){var E=b.pop();this.addPaths(b,c),b=this.addShapes(f,d[1],E)}else this.addPaths(b,c),b=this.addShapes(f,d[1]);this.addPaths(b,c)}}f.shape.paths=c}}this.dynamicProperties.length||(this.mdf=!1)},TrimModifier.prototype.addPaths=function(t,e){var r,s=t.length;for(r=0;s>r;r+=1)e.addShape(t[r])},TrimModifier.prototype.addSegment=function(t,e,r,s,i,a,n){i.setXYAt(e[0],e[1],"o",a),i.setXYAt(r[0],r[1],"i",a+1),n&&i.setXYAt(t[0],t[1],"v",a),i.setXYAt(s[0],s[1],"v",a+1)},TrimModifier.prototype.addShapes=function(t,e,r){var s,i,a,n,o,h,l,p,m=t.pathsData,f=t.shape.paths.shapes,c=t.shape.paths._length,d=0,u=[],y=!0;for(r?(o=r._length,p=r._length):(r=shape_pool.newShape(),o=0,p=0),u.push(r),s=0;c>s;s+=1){for(h=m[s].lengths,r.c=f[s].c,a=f[s].c?h.length:h.length+1,i=1;a>i;i+=1)if(n=h[i-1],d+n.addedLength<e.s)d+=n.addedLength,r.c=!1;else{if(d>e.e){r.c=!1;break}e.s<=d&&e.e>=d+n.addedLength?(this.addSegment(f[s].v[i-1],f[s].o[i-1],f[s].i[i],f[s].v[i],r,o,y),y=!1):(l=bez.getNewSegment(f[s].v[i-1],f[s].v[i],f[s].o[i-1],f[s].i[i],(e.s-d)/n.addedLength,(e.e-d)/n.addedLength,h[i-1]),this.addSegment(l.pt1,l.pt3,l.pt4,l.pt2,r,o,y),y=!1,r.c=!1),d+=n.addedLength,o+=1}if(f[s].c){if(n=h[i-1],d<=e.e){var g=h[i-1].addedLength;e.s<=d&&e.e>=d+g?(this.addSegment(f[s].v[i-1],f[s].o[i-1],f[s].i[0],f[s].v[0],r,o,y),y=!1):(l=bez.getNewSegment(f[s].v[i-1],f[s].v[0],f[s].o[i-1],f[s].i[0],(e.s-d)/g,(e.e-d)/g,h[i-1]),this.addSegment(l.pt1,l.pt3,l.pt4,l.pt2,r,o,y),y=!1,r.c=!1)}else r.c=!1;d+=n.addedLength,o+=1}if(r._length&&(r.setXYAt(r.v[p][0],r.v[p][1],"i",p),r.setXYAt(r.v[r._length-1][0],r.v[r._length-1][1],"o",r._length-1)),d>e.e)break;c-1>s&&(r=shape_pool.newShape(),y=!0,u.push(r),o=0)}return u},ShapeModifiers.registerModifier("tm",TrimModifier),extendPrototype(ShapeModifier,RoundCornersModifier),RoundCornersModifier.prototype.processKeys=function(t){if(this.elem.globalData.frameId!==this.frameId||t){this.mdf=t?!0:!1,this.frameId=this.elem.globalData.frameId;var e,r=this.dynamicProperties.length;for(e=0;r>e;e+=1)this.dynamicProperties[e].getValue(),this.dynamicProperties[e].mdf&&(this.mdf=!0)}},RoundCornersModifier.prototype.initModifierProperties=function(t,e){this.getValue=this.processKeys,this.rd=PropertyFactory.getProp(t,e.r,0,null,this.dynamicProperties),this.dynamicProperties.length||this.getValue(!0)},RoundCornersModifier.prototype.processPath=function(t,e){var r=shape_pool.newShape();r.c=t.c;var s,i,a,n,o,h,l,p,m,f,c,d,u,y=t._length,g=0;for(s=0;y>s;s+=1)i=t.v[s],n=t.o[s],a=t.i[s],i[0]===n[0]&&i[1]===n[1]&&i[0]===a[0]&&i[1]===a[1]?0!==s&&s!==y-1||t.c?(o=0===s?t.v[y-1]:t.v[s-1],h=Math.sqrt(Math.pow(i[0]-o[0],2)+Math.pow(i[1]-o[1],2)),l=h?Math.min(h/2,e)/h:0,p=d=i[0]+(o[0]-i[0])*l,m=u=i[1]-(i[1]-o[1])*l,f=p-(p-i[0])*roundCorner,c=m-(m-i[1])*roundCorner,r.setTripleAt(p,m,f,c,d,u,g),g+=1,o=s===y-1?t.v[0]:t.v[s+1],h=Math.sqrt(Math.pow(i[0]-o[0],2)+Math.pow(i[1]-o[1],2)),l=h?Math.min(h/2,e)/h:0,p=f=i[0]+(o[0]-i[0])*l,m=c=i[1]+(o[1]-i[1])*l,d=p-(p-i[0])*roundCorner,u=m-(m-i[1])*roundCorner,r.setTripleAt(p,m,f,c,d,u,g),g+=1):(r.setTripleAt(i[0],i[1],n[0],n[1],a[0],a[1],g),g+=1):(r.setTripleAt(t.v[s][0],t.v[s][1],t.o[s][0],t.o[s][1],t.i[s][0],t.i[s][1],g),g+=1);return r},RoundCornersModifier.prototype.processShapes=function(t){var e,r,s,i,a=this.shapes.length,n=this.rd.v;if(0!==n){var o,h,l;for(r=0;a>r;r+=1){if(o=this.shapes[r],h=o.shape.paths,l=o.localShapeCollection,o.shape.mdf||this.mdf||t)for(l.releaseShapes(),o.shape.mdf=!0,e=o.shape.paths.shapes,i=o.shape.paths._length,s=0;i>s;s+=1)l.addShape(this.processPath(e[s],n));o.shape.paths=o.localShapeCollection}}this.dynamicProperties.length||(this.mdf=!1)},ShapeModifiers.registerModifier("rd",RoundCornersModifier),RepeaterModifier.prototype.processKeys=function(t){if(this.elem.globalData.frameId!==this.frameId||t){this.mdf=t?!0:!1;var e,r=this.dynamicProperties.length;for(e=0;r>e;e+=1)this.dynamicProperties[e].getValue(),this.dynamicProperties[e].mdf&&(this.mdf=!0)}},RepeaterModifier.prototype.initModifierProperties=function(t,e){this.getValue=this.processKeys,this.c=PropertyFactory.getProp(t,e.c,0,null,this.dynamicProperties),this.o=PropertyFactory.getProp(t,e.o,0,null,this.dynamicProperties),this.tr=TransformPropertyFactory.getTransformProperty(t,e.tr,this.dynamicProperties),this.data=e,this.dynamicProperties.length||this.getValue(!0),this.pMatrix=new Matrix,this.rMatrix=new Matrix,this.sMatrix=new Matrix,this.tMatrix=new Matrix,this.matrix=new Matrix},RepeaterModifier.prototype.applyTransforms=function(t,e,r,s,i,a){var n=a?-1:1,o=s.s.v[0]+(1-s.s.v[0])*(1-i),h=s.s.v[1]+(1-s.s.v[1])*(1-i);t.translate(s.p.v[0]*n*i,s.p.v[1]*n*i,s.p.v[2]),e.translate(-s.a.v[0],-s.a.v[1],s.a.v[2]),e.rotate(-s.r.v*n*i),e.translate(s.a.v[0],s.a.v[1],s.a.v[2]),r.translate(-s.a.v[0],-s.a.v[1],s.a.v[2]),r.scale(a?1/o:o,a?1/h:h),r.translate(s.a.v[0],s.a.v[1],s.a.v[2])},RepeaterModifier.prototype.init=function(t,e,r,s,i){this.elem=t,this.arr=e,this.pos=r,this.elemsData=s,this._currentCopies=0,this._elements=[],this._groups=[],this.dynamicProperties=[],this.frameId=-1,this.initModifierProperties(t,e[r]);for(var a=0;r>0;)r-=1,this._elements.unshift(e[r]),a+=1;this.dynamicProperties.length?(this.k=!0,i.push(this)):this.getValue(!0)},RepeaterModifier.prototype.resetElements=function(t){var e,r=t.length;for(e=0;r>e;e+=1)t[e]._processed=!1,"gr"===t[e].ty&&this.resetElements(t[e].it)},RepeaterModifier.prototype.cloneElements=function(t){var e=(t.length,JSON.parse(JSON.stringify(t)));return this.resetElements(e),e},RepeaterModifier.prototype.changeGroupRender=function(t,e){var r,s=t.length;for(r=0;s>r;r+=1)t[r]._render=e,"gr"===t[r].ty&&this.changeGroupRender(t[r].it,e)},RepeaterModifier.prototype.processShapes=function(t){if(this.elem.globalData.frameId!==this.frameId&&(this.frameId=this.elem.globalData.frameId,this.dynamicProperties.length||t||(this.mdf=!1),this.mdf)){var e=Math.ceil(this.c.v);if(this._groups.length<e){for(;this._groups.length<e;){var r={it:this.cloneElements(this._elements),ty:"gr"};r.it.push({a:{a:0,ix:1,k:[0,0]},nm:"Transform",o:{a:0,ix:7,k:100},p:{a:0,ix:2,k:[0,0]},r:{a:0,ix:6,k:0},s:{a:0,ix:3,k:[100,100]},sa:{a:0,ix:5,k:0},sk:{a:0,ix:4,k:0},ty:"tr"}),this.arr.splice(0,0,r),this._groups.splice(0,0,r),this._currentCopies+=1}this.elem.reloadShapes()}var s,i,a=0;for(s=0;s<=this._groups.length-1;s+=1)i=e>a,this._groups[s]._render=i,this.changeGroupRender(this._groups[s].it,i),a+=1;this._currentCopies=e,this.elem.firstFrame=!0;var n=this.o.v,o=n%1,h=n>0?Math.floor(n):Math.ceil(n),l=(this.tr.v.props,this.pMatrix.props),p=this.rMatrix.props,m=this.sMatrix.props;this.pMatrix.reset(),this.rMatrix.reset(),this.sMatrix.reset(),this.tMatrix.reset(),this.matrix.reset();var f=0;if(n>0){for(;h>f;)this.applyTransforms(this.pMatrix,this.rMatrix,this.sMatrix,this.tr,1,!1),f+=1;o&&(this.applyTransforms(this.pMatrix,this.rMatrix,this.sMatrix,this.tr,o,!1),f+=o)}else if(0>n){for(;f>h;)this.applyTransforms(this.pMatrix,this.rMatrix,this.sMatrix,this.tr,1,!0),f-=1;o&&(this.applyTransforms(this.pMatrix,this.rMatrix,this.sMatrix,this.tr,-o,!0),f-=o)}s=1===this.data.m?0:this._currentCopies-1;var c=1===this.data.m?1:-1;for(a=this._currentCopies;a;){if(0!==f){(0!==s&&1===c||s!==this._currentCopies-1&&-1===c)&&this.applyTransforms(this.pMatrix,this.rMatrix,this.sMatrix,this.tr,1,!1),this.matrix.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15]),this.matrix.transform(m[0],m[1],m[2],m[3],m[4],m[5],m[6],m[7],m[8],m[9],m[10],m[11],m[12],m[13],m[14],m[15]),this.matrix.transform(l[0],l[1],l[2],l[3],l[4],l[5],l[6],l[7],l[8],l[9],l[10],l[11],l[12],l[13],l[14],l[15]);var d,u=this.elemsData[s].it,y=u[u.length-1].transform.mProps.v.props,g=y.length;for(d=0;g>d;d+=1)y[d]=this.matrix.props[d];this.matrix.reset()}else{this.matrix.reset();var d,u=this.elemsData[s].it,y=u[u.length-1].transform.mProps.v.props,g=y.length;for(d=0;g>d;d+=1)y[d]=this.matrix.props[d]}f+=1,a-=1,s+=c}}},RepeaterModifier.prototype.addShape=function(){},ShapeModifiers.registerModifier("rp",RepeaterModifier),ShapeCollection.prototype.addShape=function(t){this._length===this._maxLength&&(this.shapes=this.shapes.concat(Array.apply(null,{length:this._maxLength})),this._maxLength*=2),this.shapes[this._length]=t,this._length+=1},ShapeCollection.prototype.releaseShapes=function(){var t;for(t=0;t<this._length;t+=1)shape_pool.release(this.shapes[t]);this._length=0},DashProperty.prototype.getValue=function(t){if(this.elem.globalData.frameId!==this.frameId||t){var e=0,r=this.dataProps.length;for(this.mdf=!1,this.frameId=this.elem.globalData.frameId;r>e;){if(this.dataProps[e].p.mdf){this.mdf=!t;break}e+=1}if(this.mdf||t)for("svg"===this.renderer&&(this.dashStr=""),e=0;r>e;e+=1)"o"!=this.dataProps[e].n?"svg"===this.renderer?this.dashStr+=" "+this.dataProps[e].p.v:this.dashArray[e]=this.dataProps[e].p.v:this.dashoffset[0]=this.dataProps[e].p.v}},GradientProperty.prototype.getValue=function(t){if(this.prop.getValue(),this.cmdf=!1,this.omdf=!1,this.prop.mdf||t){var e,r,s,i=4*this.data.p;for(e=0;i>e;e+=1)r=e%4===0?100:255,s=Math.round(this.prop.v[e]*r),this.c[e]!==s&&(this.c[e]=s,this.cmdf=!t);if(this.o.length)for(i=this.prop.v.length,e=4*this.data.p;i>e;e+=1)r=e%2===0?100:1,s=e%2===0?Math.round(100*this.prop.v[e]):this.prop.v[e],this.o[e-4*this.data.p]!==s&&(this.o[e-4*this.data.p]=s,this.omdf=!t)}};var ImagePreloader=function(){function t(){this.loadedAssets+=1,this.loadedAssets===this.totalImages&&n&&n(null)}function e(t){var e="";if(this.assetsPath){var r=t.p;-1!==r.indexOf("images/")&&(r=r.split("/")[1]),e=this.assetsPath+r}else e=this.path,e+=t.u?t.u:"",e+=t.p;return e}function r(e){var r=document.createElement("img");r.addEventListener("load",t.bind(this),!1),r.addEventListener("error",t.bind(this),!1),r.src=e}function s(t,s){n=s,this.totalAssets=t.length;var i;for(i=0;i<this.totalAssets;i+=1)t[i].layers||(r.bind(this)(e.bind(this)(t[i])),this.totalImages+=1)}function i(t){this.path=t||""}function a(t){this.assetsPath=t||""}var n;return function(){this.loadAssets=s,this.setAssetsPath=a,this.setPath=i,this.assetsPath="",this.path="",this.totalAssets=0,this.totalImages=0,this.loadedAssets=0}}(),featureSupport=function(){var t={maskType:!0};return(/MSIE 10/i.test(navigator.userAgent)||/MSIE 9/i.test(navigator.userAgent)||/rv:11.0/i.test(navigator.userAgent)||/Edge\/\d./i.test(navigator.userAgent))&&(t.maskType=!1),t}(),filtersFactory=function(){function t(t){var e=document.createElementNS(svgNS,"filter");return e.setAttribute("id",t),e.setAttribute("filterUnits","objectBoundingBox"),e.setAttribute("x","0%"),e.setAttribute("y","0%"),e.setAttribute("width","100%"),e.setAttribute("height","100%"),e}function e(){var t=document.createElementNS(svgNS,"feColorMatrix");return t.setAttribute("type","matrix"),t.setAttribute("color-interpolation-filters","sRGB"),t.setAttribute("values","0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 1"),t}var r={};return r.createFilter=t,r.createAlphaToLuminanceFilter=e,r}();TextAnimatorProperty.prototype.searchProperties=function(t){var e,r,s,i=this._textData.a.length,a=PropertyFactory.getProp;for(e=0;i>e;e+=1)s=this._textData.a[e],r={a:{},s:{}},"r"in s.a&&(r.a.r=a(this._elem,s.a.r,0,degToRads,this._dynamicProperties)),"rx"in s.a&&(r.a.rx=a(this._elem,s.a.rx,0,degToRads,this._dynamicProperties)),"ry"in s.a&&(r.a.ry=a(this._elem,s.a.ry,0,degToRads,this._dynamicProperties)),"sk"in s.a&&(r.a.sk=a(this._elem,s.a.sk,0,degToRads,this._dynamicProperties)),"sa"in s.a&&(r.a.sa=a(this._elem,s.a.sa,0,degToRads,this._dynamicProperties)),"s"in s.a&&(r.a.s=a(this._elem,s.a.s,1,.01,this._dynamicProperties)),"a"in s.a&&(r.a.a=a(this._elem,s.a.a,1,0,this._dynamicProperties)),"o"in s.a&&(r.a.o=a(this._elem,s.a.o,0,.01,this._dynamicProperties)),"p"in s.a&&(r.a.p=a(this._elem,s.a.p,1,0,this._dynamicProperties)),"sw"in s.a&&(r.a.sw=a(this._elem,s.a.sw,0,0,this._dynamicProperties)),"sc"in s.a&&(r.a.sc=a(this._elem,s.a.sc,1,0,this._dynamicProperties)),"fc"in s.a&&(r.a.fc=a(this._elem,s.a.fc,1,0,this._dynamicProperties)),"fh"in s.a&&(r.a.fh=a(this._elem,s.a.fh,0,0,this._dynamicProperties)),"fs"in s.a&&(r.a.fs=a(this._elem,s.a.fs,0,.01,this._dynamicProperties)),"fb"in s.a&&(r.a.fb=a(this._elem,s.a.fb,0,.01,this._dynamicProperties)),"t"in s.a&&(r.a.t=a(this._elem,s.a.t,0,0,this._dynamicProperties)),r.s=TextSelectorProp.getTextSelectorProp(this._elem,s.s,this._dynamicProperties),r.s.t=s.s.t,this._animatorsData[e]=r;this._textData.p&&"m"in this._textData.p?(this._pathData={f:a(this._elem,this._textData.p.f,0,0,this._dynamicProperties),l:a(this._elem,this._textData.p.l,0,0,this._dynamicProperties),r:this._textData.p.r,m:this._elem.maskManager.getMaskProperty(this._textData.p.m)},this._hasMaskedPath=!0):this._hasMaskedPath=!1,this._moreOptions.alignment=a(this._elem,this._textData.m.a,1,0,this._dynamicProperties),this._dynamicProperties.length&&t.push(this)},TextAnimatorProperty.prototype.getMeasures=function(t,e){if(this.lettersChangedFlag=e,this.mdf||this._firstFrame||e||this._hasMaskedPath&&this._pathData.m.mdf){this._firstFrame=!1;var r,s,i,a,n=this._moreOptions.alignment.v,o=this._animatorsData,h=this._textData,l=this.mHelper,p=this._renderType,m=this.renderedLetters.length,f=(this.data,t.l);if(this._hasMaskedPath){var c=this._pathData.m;if(!this._pathData.n||this._pathData.mdf){var d=c.v;this._pathData.r&&(d=d.reverse());var u={tLength:0,segments:[]};a=d._length-1;var y,g=0;for(i=0;a>i;i+=1)y={s:d.v[i],e:d.v[i+1],to:[d.o[i][0]-d.v[i][0],d.o[i][1]-d.v[i][1]],ti:[d.i[i+1][0]-d.v[i+1][0],d.i[i+1][1]-d.v[i+1][1]]},bez.buildBezierData(y),u.tLength+=y.bezierData.segmentLength,u.segments.push(y),g+=y.bezierData.segmentLength;i=a,c.v.c&&(y={s:d.v[i],e:d.v[0],to:[d.o[i][0]-d.v[i][0],d.o[i][1]-d.v[i][1]],ti:[d.i[0][0]-d.v[0][0],d.i[0][1]-d.v[0][1]]},bez.buildBezierData(y),u.tLength+=y.bezierData.segmentLength,u.segments.push(y),g+=y.bezierData.segmentLength),this._pathData.pi=u}var v,b,E,u=this._pathData.pi,P=this._pathData.f.v,x=0,S=1,C=0,k=!0,A=u.segments;if(0>P&&c.v.c)for(u.tLength<Math.abs(P)&&(P=-Math.abs(P)%u.tLength),x=A.length-1,E=A[x].bezierData.points,S=E.length-1;0>P;)P+=E[S].partialLength,S-=1,0>S&&(x-=1,E=A[x].bezierData.points,S=E.length-1);E=A[x].bezierData.points,b=E[S-1],v=E[S];var M,D,w=v.partialLength}a=f.length,r=0,s=0;var T,_,I,F,V,R=1.2*t.s*.714,N=!0;F=o.length;var B,L,O,G,j,H,z,W,q,Y,X,J,U,K=-1,Z=P,Q=x,$=S,tt=-1,et=0,rt="",st=this.defaultPropsArray;for(i=0;a>i;i+=1){if(l.reset(),j=1,f[i].n)r=0,s+=t.yOffset,s+=N?1:0,P=Z,N=!1,et=0,this._hasMaskedPath&&(x=Q,S=$,E=A[x].bezierData.points,b=E[S-1],v=E[S],w=v.partialLength,C=0),U=Y=J=rt="",st=this.defaultPropsArray;else{if(this._hasMaskedPath){if(tt!==f[i].line){switch(t.j){case 1:P+=g-t.lineWidths[f[i].line];break;case 2:P+=(g-t.lineWidths[f[i].line])/2}tt=f[i].line}K!==f[i].ind&&(f[K]&&(P+=f[K].extra),P+=f[i].an/2,K=f[i].ind),P+=n[0]*f[i].an/200;var it=0;for(I=0;F>I;I+=1)T=o[I].a,"p"in T&&(_=o[I].s,B=_.getMult(f[i].anIndexes[I],h.a[I].s.totalChars),it+=B.length?T.p.v[0]*B[0]:T.p.v[0]*B),"a"in T&&(_=o[I].s,B=_.getMult(f[i].anIndexes[I],h.a[I].s.totalChars),it+=B.length?T.a.v[0]*B[0]:T.a.v[0]*B);for(k=!0;k;)C+w>=P+it||!E?(M=(P+it-C)/v.partialLength,O=b.point[0]+(v.point[0]-b.point[0])*M,G=b.point[1]+(v.point[1]-b.point[1])*M,l.translate(-n[0]*f[i].an/200,-(n[1]*R/100)),k=!1):E&&(C+=v.partialLength,S+=1,S>=E.length&&(S=0,x+=1,A[x]?E=A[x].bezierData.points:c.v.c?(S=0,x=0,E=A[x].bezierData.points):(C-=v.partialLength,E=null)),E&&(b=v,v=E[S],w=v.partialLength));L=f[i].an/2-f[i].add,l.translate(-L,0,0)}else L=f[i].an/2-f[i].add,l.translate(-L,0,0),l.translate(-n[0]*f[i].an/200,-n[1]*R/100,0);for(et+=f[i].l/2,I=0;F>I;I+=1)T=o[I].a,"t"in T&&(_=o[I].s,B=_.getMult(f[i].anIndexes[I],h.a[I].s.totalChars),this._hasMaskedPath?P+=B.length?T.t*B[0]:T.t*B:r+=B.length?T.t.v*B[0]:T.t.v*B);for(et+=f[i].l/2,t.strokeWidthAnim&&(z=t.sw||0),t.strokeColorAnim&&(H=t.sc?[t.sc[0],t.sc[1],t.sc[2]]:[0,0,0]),t.fillColorAnim&&t.fc&&(W=[t.fc[0],t.fc[1],t.fc[2]]),I=0;F>I;I+=1)T=o[I].a,"a"in T&&(_=o[I].s,B=_.getMult(f[i].anIndexes[I],h.a[I].s.totalChars),B.length?l.translate(-T.a.v[0]*B[0],-T.a.v[1]*B[1],T.a.v[2]*B[2]):l.translate(-T.a.v[0]*B,-T.a.v[1]*B,T.a.v[2]*B));for(I=0;F>I;I+=1)T=o[I].a,"s"in T&&(_=o[I].s,B=_.getMult(f[i].anIndexes[I],h.a[I].s.totalChars),B.length?l.scale(1+(T.s.v[0]-1)*B[0],1+(T.s.v[1]-1)*B[1],1):l.scale(1+(T.s.v[0]-1)*B,1+(T.s.v[1]-1)*B,1));for(I=0;F>I;I+=1){if(T=o[I].a,_=o[I].s,B=_.getMult(f[i].anIndexes[I],h.a[I].s.totalChars),"sk"in T&&(B.length?l.skewFromAxis(-T.sk.v*B[0],T.sa.v*B[1]):l.skewFromAxis(-T.sk.v*B,T.sa.v*B)),"r"in T&&l.rotateZ(B.length?-T.r.v*B[2]:-T.r.v*B),"ry"in T&&l.rotateY(B.length?T.ry.v*B[1]:T.ry.v*B),"rx"in T&&l.rotateX(B.length?T.rx.v*B[0]:T.rx.v*B),"o"in T&&(j+=B.length?(T.o.v*B[0]-j)*B[0]:(T.o.v*B-j)*B),t.strokeWidthAnim&&"sw"in T&&(z+=B.length?T.sw.v*B[0]:T.sw.v*B),t.strokeColorAnim&&"sc"in T)for(q=0;3>q;q+=1)H[q]=B.length?H[q]+(T.sc.v[q]-H[q])*B[0]:H[q]+(T.sc.v[q]-H[q])*B;if(t.fillColorAnim&&t.fc){if("fc"in T)for(q=0;3>q;q+=1)W[q]=B.length?W[q]+(T.fc.v[q]-W[q])*B[0]:W[q]+(T.fc.v[q]-W[q])*B;"fh"in T&&(W=B.length?addHueToRGB(W,T.fh.v*B[0]):addHueToRGB(W,T.fh.v*B)),"fs"in T&&(W=B.length?addSaturationToRGB(W,T.fs.v*B[0]):addSaturationToRGB(W,T.fs.v*B)),"fb"in T&&(W=B.length?addBrightnessToRGB(W,T.fb.v*B[0]):addBrightnessToRGB(W,T.fb.v*B))}}for(I=0;F>I;I+=1)T=o[I].a,"p"in T&&(_=o[I].s,B=_.getMult(f[i].anIndexes[I],h.a[I].s.totalChars),this._hasMaskedPath?B.length?l.translate(0,T.p.v[1]*B[0],-T.p.v[2]*B[1]):l.translate(0,T.p.v[1]*B,-T.p.v[2]*B):B.length?l.translate(T.p.v[0]*B[0],T.p.v[1]*B[1],-T.p.v[2]*B[2]):l.translate(T.p.v[0]*B,T.p.v[1]*B,-T.p.v[2]*B));if(t.strokeWidthAnim&&(Y=0>z?0:z),t.strokeColorAnim&&(X="rgb("+Math.round(255*H[0])+","+Math.round(255*H[1])+","+Math.round(255*H[2])+")"),t.fillColorAnim&&t.fc&&(J="rgb("+Math.round(255*W[0])+","+Math.round(255*W[1])+","+Math.round(255*W[2])+")"),this._hasMaskedPath){if(l.translate(0,-t.ls),l.translate(0,n[1]*R/100+s,0),h.p.p){D=(v.point[1]-b.point[1])/(v.point[0]-b.point[0]);var at=180*Math.atan(D)/Math.PI;v.point[0]<b.point[0]&&(at+=180),l.rotate(-at*Math.PI/180)}l.translate(O,G,0),P-=n[0]*f[i].an/200,f[i+1]&&K!==f[i+1].ind&&(P+=f[i].an/2,P+=t.tr/1e3*t.s)}else{switch(l.translate(r,s,0),t.ps&&l.translate(t.ps[0],t.ps[1]+t.ascent,0),t.j){case 1:l.translate(t.justifyOffset+(t.boxWidth-t.lineWidths[f[i].line]),0,0);break;case 2:l.translate(t.justifyOffset+(t.boxWidth-t.lineWidths[f[i].line])/2,0,0)}l.translate(0,-t.ls),l.translate(L,0,0),l.translate(n[0]*f[i].an/200,n[1]*R/100,0),r+=f[i].l+t.tr/1e3*t.s}"html"===p?rt=l.toCSS():"svg"===p?rt=l.to2dCSS():st=[l.props[0],l.props[1],l.props[2],l.props[3],l.props[4],l.props[5],l.props[6],l.props[7],l.props[8],l.props[9],l.props[10],l.props[11],l.props[12],l.props[13],l.props[14],l.props[15]],U=j}i>=m?(V=new LetterProps(U,Y,X,J,rt,st),this.renderedLetters.push(V),m+=1,this.lettersChangedFlag=!0):(V=this.renderedLetters[i],this.lettersChangedFlag=V.update(U,Y,X,J,rt,st)||this.lettersChangedFlag)}}},TextAnimatorProperty.prototype.getValue=function(){if(this._elem.globalData.frameId!==this._frameId){this._frameId=this._elem.globalData.frameId;var t,e=this._dynamicProperties.length;for(this.mdf=!1,t=0;e>t;t+=1)this._dynamicProperties[t].getValue(),this.mdf=this._dynamicProperties[t].mdf||this.mdf}},TextAnimatorProperty.prototype.mHelper=new Matrix,TextAnimatorProperty.prototype.defaultPropsArray=[],LetterProps.prototype.update=function(t,e,r,s,i,a){this.mdf.o=!1,this.mdf.sw=!1,this.mdf.sc=!1,this.mdf.fc=!1,this.mdf.m=!1,this.mdf.p=!1;var n=!1;return this.o!==t&&(this.o=t,this.mdf.o=!0,n=!0),this.sw!==e&&(this.sw=e,this.mdf.sw=!0,n=!0),this.sc!==r&&(this.sc=r,this.mdf.sc=!0,n=!0),this.fc!==s&&(this.fc=s,this.mdf.fc=!0,n=!0),this.m!==i&&(this.m=i,this.mdf.m=!0,n=!0),!a.length||this.p[0]===a[0]&&this.p[1]===a[1]&&this.p[4]===a[4]&&this.p[5]===a[5]&&this.p[12]===a[12]&&this.p[13]===a[13]||(this.p=a,this.mdf.p=!0,n=!0),n},TextProperty.prototype.setCurrentData=function(t){var e=this.currentData;e.ascent=t.ascent,e.boxWidth=t.boxWidth?t.boxWidth:e.boxWidth,e.f=t.f,e.fStyle=t.fStyle,e.fWeight=t.fWeight,e.fc=t.fc,e.j=t.j,e.justifyOffset=t.justifyOffset,e.l=t.l,e.lh=t.lh,e.lineWidths=t.lineWidths,e.ls=t.ls,e.of=t.of,e.s=t.s,e.sc=t.sc,e.sw=t.sw,e.t=t.t,e.tr=t.tr,e.fillColorAnim=t.fillColorAnim||e.fillColorAnim,e.strokeColorAnim=t.strokeColorAnim||e.strokeColorAnim,e.strokeWidthAnim=t.strokeWidthAnim||e.strokeWidthAnim,e.yOffset=t.yOffset,e.__complete=!1},TextProperty.prototype.searchProperty=function(){return this.kf=this.data.d.k.length>1,this.kf},TextProperty.prototype.getValue=function(){this.mdf=!1;var t=this.elem.globalData.frameId;if(t!==this._frameId&&this.kf||this.firstFrame){for(var e,r=this.data.d.k,s=0,i=r.length;i-1>=s&&(e=r[s].s,!(s===i-1||r[s+1].t>t));)s+=1;this.keysIndex!==s&&(e.__complete||this.completeTextData(e),this.setCurrentData(e),this.mdf=this.firstFrame?!1:!0,this.pv=this.v=this.currentData.t,this.keysIndex=s),this._frameId=t}},TextProperty.prototype.completeTextData=function(t){t.__complete=!0;var e,r,s,i,a,n,o,h=this.elem.globalData.fontManager,l=this.data,p=[],m=0,f=l.m.g,c=0,d=0,u=0,y=[],g=0,v=0,b=h.getFontByName(t.f),E=0,P=b.fStyle.split(" "),x="normal",S="normal";r=P.length;var C;for(e=0;r>e;e+=1)switch(C=P[e].toLowerCase()){case"italic":S="italic";break;case"bold":x="700";break;case"black":x="900";break;case"medium":x="500";break;case"regular":case"normal":x="400";case"light":case"thin":x="200"}t.fWeight=x,t.fStyle=S,r=t.t.length;var k=t.tr/1e3*t.s;if(t.sz){var A=t.sz[0],M=-1;for(e=0;r>e;e+=1)s=!1," "===t.t.charAt(e)?M=e:13===t.t.charCodeAt(e)&&(g=0,s=!0),h.chars?(o=h.getCharData(t.t.charAt(e),b.fStyle,b.fFamily),E=s?0:o.w*t.s/100):E=h.measureText(t.t.charAt(e),t.f,t.s),g+E>A&&" "!==t.t.charAt(e)?(-1===M?r+=1:e=M,t.t=t.t.substr(0,e)+"\r"+t.t.substr(e===M?e+1:e),M=-1,g=0):(g+=E,g+=k);r=t.t.length}g=-k,E=0;var D,w=0;for(e=0;r>e;e+=1)if(s=!1,D=t.t.charAt(e)," "===D?i="\xa0":13===D.charCodeAt(0)?(w=0,y.push(g),v=g>v?g:v,g=-2*k,i="",s=!0,u+=1):i=t.t.charAt(e),h.chars?(o=h.getCharData(D,b.fStyle,h.getFontByName(t.f).fFamily),E=s?0:o.w*t.s/100):E=h.measureText(i,t.f,t.s)," "===D?w+=E+k:(g+=E+k+w,w=0),p.push({l:E,an:E,add:c,n:s,anIndexes:[],val:i,line:u}),2==f){if(c+=E,""==i||"\xa0"==i||e==r-1){for((""==i||"\xa0"==i)&&(c-=E);e>=d;)p[d].an=c,p[d].ind=m,p[d].extra=E,d+=1;m+=1,c=0}}else if(3==f){if(c+=E,""==i||e==r-1){for(""==i&&(c-=E);e>=d;)p[d].an=c,p[d].ind=m,p[d].extra=E,d+=1;c=0,m+=1}}else p[m].ind=m,p[m].extra=0,m+=1;if(t.l=p,v=g>v?g:v,y.push(g),t.sz)t.boxWidth=t.sz[0],t.justifyOffset=0;else switch(t.boxWidth=v,t.j){case 1:t.justifyOffset=-t.boxWidth;break;case 2:t.justifyOffset=-t.boxWidth/2;break;default:t.justifyOffset=0}t.lineWidths=y;var T,_,I=l.a;n=I.length;var F,V,R=[];for(a=0;n>a;a+=1){for(T=I[a],T.a.sc&&(t.strokeColorAnim=!0),T.a.sw&&(t.strokeWidthAnim=!0),(T.a.fc||T.a.fh||T.a.fs||T.a.fb)&&(t.fillColorAnim=!0),V=0,F=T.s.b,e=0;r>e;e+=1)_=p[e],_.anIndexes[a]=V,(1==F&&""!=_.val||2==F&&""!=_.val&&"\xa0"!=_.val||3==F&&(_.n||"\xa0"==_.val||e==r-1)||4==F&&(_.n||e==r-1))&&(1===T.s.rn&&R.push(V),V+=1);l.a[a].s.totalChars=V;var N,B=-1;if(1===T.s.rn)for(e=0;r>e;e+=1)_=p[e],B!=_.anIndexes[a]&&(B=_.anIndexes[a],N=R.splice(Math.floor(Math.random()*R.length),1)[0]),_.anIndexes[a]=N}t.yOffset=t.lh||1.2*t.s,t.ls=t.ls||0,t.ascent=b.ascent*t.s/100},TextProperty.prototype.updateDocumentData=function(t,e){e=void 0===e?this.keysIndex:e;var r=this.data.d.k[e].s;r.__complete=!1,r.t=t.t,this.keysIndex=-1,this.firstFrame=!0,this.getValue()};var TextSelectorProp=function(){function t(t){if(this.mdf=t||!1,this.dynamicProperties.length){var e,r=this.dynamicProperties.length;for(e=0;r>e;e+=1)this.dynamicProperties[e].getValue(),this.dynamicProperties[e].mdf&&(this.mdf=!0)}var s=this.elem.textProperty.currentData?this.elem.textProperty.currentData.l.length:0;t&&2===this.data.r&&(this.e.v=s);var i=2===this.data.r?1:100/s,a=this.o.v/i,n=this.s.v/i+a,o=this.e.v/i+a;if(n>o){var h=n;n=o,o=h}this.finalS=n,this.finalE=o}function e(t){var e=BezierFactory.getBezierEasing(this.ne.v/100,0,1-this.xe.v/100,1).get,r=0,s=this.finalS,o=this.finalE,h=this.data.sh;if(2==h)r=o===s?t>=o?1:0:i(0,a(.5/(o-s)+(t-s)/(o-s),1)),r=e(r);else if(3==h)r=o===s?t>=o?0:1:1-i(0,a(.5/(o-s)+(t-s)/(o-s),1)),r=e(r);else if(4==h)o===s?r=0:(r=i(0,a(.5/(o-s)+(t-s)/(o-s),1)),.5>r?r*=2:r=1-2*(r-.5)),r=e(r);else if(5==h){if(o===s)r=0;else{var l=o-s;t=a(i(0,t+.5-s),o-s);var p=-l/2+t,m=l/2;r=Math.sqrt(1-p*p/(m*m))}r=e(r)}else 6==h?(o===s?r=0:(t=a(i(0,t+.5-s),o-s),r=(1+Math.cos(Math.PI+2*Math.PI*t/(o-s)))/2),r=e(r)):(t>=n(s)&&(r=0>t-s?1-(s-t):i(0,a(o-t,1))),r=e(r));return r*this.a.v}function r(r,s,i){this.mdf=!1,this.k=!1,this.data=s,this.dynamicProperties=[],this.getValue=t,this.getMult=e,this.elem=r,this.comp=r.comp,this.finalS=0,this.finalE=0,this.s=PropertyFactory.getProp(r,s.s||{k:0},0,0,this.dynamicProperties),this.e="e"in s?PropertyFactory.getProp(r,s.e,0,0,this.dynamicProperties):{v:100},this.o=PropertyFactory.getProp(r,s.o||{k:0},0,0,this.dynamicProperties),this.xe=PropertyFactory.getProp(r,s.xe||{k:0},0,0,this.dynamicProperties),this.ne=PropertyFactory.getProp(r,s.ne||{k:0},0,0,this.dynamicProperties),this.a=PropertyFactory.getProp(r,s.a,0,.01,this.dynamicProperties),this.dynamicProperties.length?i.push(this):this.getValue()}function s(t,e,s){return new r(t,e,s)}var i=Math.max,a=Math.min,n=Math.floor;return{getTextSelectorProp:s}}(),pooling=function(){function t(t){return t.concat(Array.apply(null,{length:t.length}))}return{"double":t}}(),point_pool=function(){function t(){var t;return s?(s-=1,t=a[s]):t=createTypedArray("float32",2),t}function e(t){s===i&&(a=pooling["double"](a),i=2*i),a[s]=t,s+=1}var r={newPoint:t,release:e},s=0,i=8,a=Array.apply(null,{length:i});return r}(),shape_pool=function(){function t(){var t;return a?(a-=1,t=o[a]):t=new ShapePath,t}function e(t){a===n&&(o=pooling["double"](o),n=2*n);var e,r=t._length;for(e=0;r>e;e+=1)point_pool.release(t.v[e]),point_pool.release(t.i[e]),point_pool.release(t.o[e]),t.v[e]=null,t.i[e]=null,t.o[e]=null;t._length=0,t.c=!1,o[a]=t,a+=1}function r(t,r){for(;r--;)e(t[r])}function s(e,r){var s,i=void 0===e._length?e.v.length:e._length,a=t();a.setLength(i),a.c=e.c;var n;for(s=0;i>s;s+=1)r?(n=r.applyToPointArray(e.v[s][0],e.v[s][1],0,2),
a.setXYAt(n[0],n[1],"v",s),point_pool.release(n),n=r.applyToPointArray(e.o[s][0],e.o[s][1],0,2),a.setXYAt(n[0],n[1],"o",s),point_pool.release(n),n=r.applyToPointArray(e.i[s][0],e.i[s][1],0,2),a.setXYAt(n[0],n[1],"i",s),point_pool.release(n)):a.setTripleAt(e.v[s][0],e.v[s][1],e.o[s][0],e.o[s][1],e.i[s][0],e.i[s][1],s);return a}var i={clone:s,newShape:t,release:e,releaseArray:r},a=0,n=4,o=Array.apply(null,{length:n});return i}(),shapeCollection_pool=function(){function t(){var t;return i?(i-=1,t=n[i]):t=new ShapeCollection,t}function e(t){var e,r=t._length;for(e=0;r>e;e+=1)shape_pool.release(t.shapes[e]);t._length=0,i===a&&(n=pooling["double"](n),a=2*a),n[i]=t,i+=1}function r(t,r){e(t),i===a&&(n=pooling["double"](n),a=2*a),n[i]=t,i+=1}var s={newShapeCollection:t,release:e,clone:r},i=0,a=4,n=Array.apply(null,{length:a});return s}();BaseRenderer.prototype.checkLayers=function(t){var e,r,s=this.layers.length;for(this.completeLayers=!0,e=s-1;e>=0;e--)this.elements[e]||(r=this.layers[e],r.ip-r.st<=t-this.layers[e].st&&r.op-r.st>t-this.layers[e].st&&this.buildItem(e)),this.completeLayers=this.elements[e]?this.completeLayers:!1;this.checkPendingElements()},BaseRenderer.prototype.createItem=function(t){switch(t.ty){case 2:return this.createImage(t);case 0:return this.createComp(t);case 1:return this.createSolid(t);case 4:return this.createShape(t);case 5:return this.createText(t);case 13:return this.createCamera(t);case 99:return null}return this.createBase(t)},BaseRenderer.prototype.createCamera=function(){throw new Error("You're using a 3d camera. Try the html renderer.")},BaseRenderer.prototype.buildAllItems=function(){var t,e=this.layers.length;for(t=0;e>t;t+=1)this.buildItem(t);this.checkPendingElements()},BaseRenderer.prototype.includeLayers=function(t){this.completeLayers=!1;var e,r,s=t.length,i=this.layers.length;for(e=0;s>e;e+=1)for(r=0;i>r;){if(this.layers[r].id==t[e].id){this.layers[r]=t[e];break}r+=1}},BaseRenderer.prototype.setProjectInterface=function(t){this.globalData.projectInterface=t},BaseRenderer.prototype.initItems=function(){this.globalData.progressiveLoad||this.buildAllItems()},BaseRenderer.prototype.buildElementParenting=function(t,e,r){r=r||[];for(var s=this.elements,i=this.layers,a=0,n=i.length;n>a;)i[a].ind==e&&(s[a]&&s[a]!==!0?void 0!==i[a].parent?(r.push(s[a]),s[a]._isParent=!0,this.buildElementParenting(t,i[a].parent,r)):(r.push(s[a]),s[a]._isParent=!0,t.setHierarchy(r)):(this.buildItem(a),this.addPendingElement(t))),a+=1},BaseRenderer.prototype.addPendingElement=function(t){this.pendingElements.push(t)},extendPrototype(BaseRenderer,SVGRenderer),SVGRenderer.prototype.createBase=function(t){return new SVGBaseElement(t,this.layerElement,this.globalData,this)},SVGRenderer.prototype.createShape=function(t){return new IShapeElement(t,this.layerElement,this.globalData,this)},SVGRenderer.prototype.createText=function(t){return new SVGTextElement(t,this.layerElement,this.globalData,this)},SVGRenderer.prototype.createImage=function(t){return new IImageElement(t,this.layerElement,this.globalData,this)},SVGRenderer.prototype.createComp=function(t){return new ICompElement(t,this.layerElement,this.globalData,this)},SVGRenderer.prototype.createSolid=function(t){return new ISolidElement(t,this.layerElement,this.globalData,this)},SVGRenderer.prototype.configAnimation=function(t){this.layerElement=document.createElementNS(svgNS,"svg"),this.layerElement.setAttribute("xmlns","http://www.w3.org/2000/svg"),this.layerElement.setAttribute("viewBox","0 0 "+t.w+" "+t.h),this.renderConfig.viewBoxOnly||(this.layerElement.setAttribute("width",t.w),this.layerElement.setAttribute("height",t.h),this.layerElement.style.width="100%",this.layerElement.style.height="100%"),this.renderConfig.className&&this.layerElement.setAttribute("class",this.renderConfig.className),this.layerElement.setAttribute("preserveAspectRatio",this.renderConfig.preserveAspectRatio),this.animationItem.wrapper.appendChild(this.layerElement);var e=document.createElementNS(svgNS,"defs");this.globalData.defs=e,this.layerElement.appendChild(e),this.globalData.getAssetData=this.animationItem.getAssetData.bind(this.animationItem),this.globalData.getAssetsPath=this.animationItem.getAssetsPath.bind(this.animationItem),this.globalData.progressiveLoad=this.renderConfig.progressiveLoad,this.globalData.frameId=0,this.globalData.nm=t.nm,this.globalData.compSize={w:t.w,h:t.h},this.data=t,this.globalData.frameRate=t.fr;var r=document.createElementNS(svgNS,"clipPath"),s=document.createElementNS(svgNS,"rect");s.setAttribute("width",t.w),s.setAttribute("height",t.h),s.setAttribute("x",0),s.setAttribute("y",0);var i="animationMask_"+randomString(10);r.setAttribute("id",i),r.appendChild(s);var a=document.createElementNS(svgNS,"g");a.setAttribute("clip-path","url("+locationHref+"#"+i+")"),this.layerElement.appendChild(a),e.appendChild(r),this.layerElement=a,this.layers=t.layers,this.globalData.fontManager=new FontManager,this.globalData.fontManager.addChars(t.chars),this.globalData.fontManager.addFonts(t.fonts,e),this.elements=Array.apply(null,{length:t.layers.length})},SVGRenderer.prototype.destroy=function(){this.animationItem.wrapper.innerHTML="",this.layerElement=null,this.globalData.defs=null;var t,e=this.layers?this.layers.length:0;for(t=0;e>t;t++)this.elements[t]&&this.elements[t].destroy();this.elements.length=0,this.destroyed=!0,this.animationItem=null},SVGRenderer.prototype.updateContainerSize=function(){},SVGRenderer.prototype.buildItem=function(t){var e=this.elements;if(!e[t]&&99!=this.layers[t].ty){e[t]=!0;var r=this.createItem(this.layers[t]);e[t]=r,expressionsPlugin&&(0===this.layers[t].ty&&this.globalData.projectInterface.registerComposition(r),r.initExpressions()),this.appendElementInPos(r,t),this.layers[t].tt&&(this.elements[t-1]&&this.elements[t-1]!==!0?r.setMatte(e[t-1].layerId):(this.buildItem(t-1),this.addPendingElement(r)))}},SVGRenderer.prototype.checkPendingElements=function(){for(;this.pendingElements.length;){var t=this.pendingElements.pop();if(t.checkParenting(),t.data.tt)for(var e=0,r=this.elements.length;r>e;){if(this.elements[e]===t){t.setMatte(this.elements[e-1].layerId);break}e+=1}}},SVGRenderer.prototype.renderFrame=function(t){if(this.renderedFrame!=t&&!this.destroyed){null===t?t=this.renderedFrame:this.renderedFrame=t,this.globalData.frameNum=t,this.globalData.frameId+=1,this.globalData.projectInterface.currentFrame=t;var e,r=this.layers.length;for(this.completeLayers||this.checkLayers(t),e=r-1;e>=0;e--)(this.completeLayers||this.elements[e])&&this.elements[e].prepareFrame(t-this.layers[e].st);for(e=r-1;e>=0;e--)(this.completeLayers||this.elements[e])&&this.elements[e].renderFrame()}},SVGRenderer.prototype.appendElementInPos=function(t,e){var r=t.getBaseElement();if(r){for(var s,i=0;e>i;)this.elements[i]&&this.elements[i]!==!0&&this.elements[i].getBaseElement()&&(s=this.elements[i].getBaseElement()),i+=1;s?this.layerElement.insertBefore(r,s):this.layerElement.appendChild(r)}},SVGRenderer.prototype.hide=function(){this.layerElement.style.display="none"},SVGRenderer.prototype.show=function(){this.layerElement.style.display="block"},SVGRenderer.prototype.searchExtraCompositions=function(t){var e,r=t.length,s=document.createElementNS(svgNS,"g");for(e=0;r>e;e+=1)if(t[e].xt){var i=this.createComp(t[e],s,this.globalData.comp,null);i.initExpressions(),this.globalData.projectInterface.registerComposition(i)}},MaskElement.prototype.getMaskProperty=function(t){return this.viewData[t].prop},MaskElement.prototype.prepareFrame=function(){var t,e=this.dynamicProperties.length;for(t=0;e>t;t+=1)this.dynamicProperties[t].getValue()},MaskElement.prototype.renderFrame=function(t){var e,r=this.masksProperties.length;for(e=0;r>e;e++)if((this.viewData[e].prop.mdf||this.firstFrame)&&this.drawPath(this.masksProperties[e],this.viewData[e].prop.v,this.viewData[e]),(this.viewData[e].op.mdf||this.firstFrame)&&this.viewData[e].elem.setAttribute("fill-opacity",this.viewData[e].op.v),"n"!==this.masksProperties[e].mode&&(this.viewData[e].invRect&&(this.element.finalTransform.mProp.mdf||this.firstFrame)&&(this.viewData[e].invRect.setAttribute("x",-t.props[12]),this.viewData[e].invRect.setAttribute("y",-t.props[13])),this.storedData[e].x&&(this.storedData[e].x.mdf||this.firstFrame))){var s=this.storedData[e].expan;this.storedData[e].x.v<0?("erode"!==this.storedData[e].lastOperator&&(this.storedData[e].lastOperator="erode",this.storedData[e].elem.setAttribute("filter","url("+locationHref+"#"+this.storedData[e].filterId+")")),s.setAttribute("radius",-this.storedData[e].x.v)):("dilate"!==this.storedData[e].lastOperator&&(this.storedData[e].lastOperator="dilate",this.storedData[e].elem.setAttribute("filter",null)),this.storedData[e].elem.setAttribute("stroke-width",2*this.storedData[e].x.v))}this.firstFrame=!1},MaskElement.prototype.getMaskelement=function(){return this.maskElement},MaskElement.prototype.createLayerSolidPath=function(){var t="M0,0 ";return t+=" h"+this.globalData.compSize.w,t+=" v"+this.globalData.compSize.h,t+=" h-"+this.globalData.compSize.w,t+=" v-"+this.globalData.compSize.h+" "},MaskElement.prototype.drawPath=function(t,e,r){var s,i,a=" M"+e.v[0][0]+","+e.v[0][1];for(i=e._length,s=1;i>s;s+=1)a+=" C"+bm_rnd(e.o[s-1][0])+","+bm_rnd(e.o[s-1][1])+" "+bm_rnd(e.i[s][0])+","+bm_rnd(e.i[s][1])+" "+bm_rnd(e.v[s][0])+","+bm_rnd(e.v[s][1]);e.c&&i>1&&(a+=" C"+bm_rnd(e.o[s-1][0])+","+bm_rnd(e.o[s-1][1])+" "+bm_rnd(e.i[0][0])+","+bm_rnd(e.i[0][1])+" "+bm_rnd(e.v[0][0])+","+bm_rnd(e.v[0][1])),r.lastPath!==a&&(r.elem&&(e.c?t.inv?r.elem.setAttribute("d",this.solidPath+a):r.elem.setAttribute("d",a):r.elem.setAttribute("d","")),r.lastPath=a)},MaskElement.prototype.destroy=function(){this.element=null,this.globalData=null,this.maskElement=null,this.data=null,this.masksProperties=null},BaseElement.prototype.checkMasks=function(){if(!this.data.hasMask)return!1;for(var t=0,e=this.data.masksProperties.length;e>t;){if("n"!==this.data.masksProperties[t].mode&&this.data.masksProperties[t].cl!==!1)return!0;t+=1}return!1},BaseElement.prototype.checkParenting=function(){void 0!==this.data.parent&&this.comp.buildElementParenting(this,this.data.parent)},BaseElement.prototype.prepareFrame=function(t){this.data.ip-this.data.st<=t&&this.data.op-this.data.st>t?this.isVisible!==!0&&(this.elemMdf=!0,this.globalData.mdf=!0,this.isVisible=!0,this.firstFrame=!0,this.data.hasMask&&(this.maskManager.firstFrame=!0)):this.isVisible!==!1&&(this.elemMdf=!0,this.globalData.mdf=!0,this.isVisible=!1);var e,r=this.dynamicProperties.length;for(e=0;r>e;e+=1)(this.isVisible||this._isParent&&"transform"===this.dynamicProperties[e].type)&&(this.dynamicProperties[e].getValue(),this.dynamicProperties[e].mdf&&(this.elemMdf=!0,this.globalData.mdf=!0));return this.data.hasMask&&this.isVisible&&this.maskManager.prepareFrame(t*this.data.sr),this.currentFrameNum=t*this.data.sr,this.isVisible},BaseElement.prototype.globalToLocal=function(t){var e=[];e.push(this.finalTransform);for(var r=!0,s=this.comp;r;)s.finalTransform?(s.data.hasMask&&e.splice(0,0,s.finalTransform),s=s.comp):r=!1;var i,a,n=e.length;for(i=0;n>i;i+=1)a=e[i].mat.applyToPointArray(0,0,0),t=[t[0]-a[0],t[1]-a[1],0];return t},BaseElement.prototype.initExpressions=function(){this.layerInterface=LayerExpressionInterface(this),this.data.hasMask&&this.layerInterface.registerMaskInterface(this.maskManager);var t=EffectsExpressionInterface.createEffectsInterface(this,this.layerInterface);this.layerInterface.registerEffectsInterface(t),0===this.data.ty||this.data.xt?this.compInterface=CompExpressionInterface(this):4===this.data.ty?this.layerInterface.shapeInterface=ShapeExpressionInterface.createShapeInterface(this.shapesData,this.itemsData,this.layerInterface):5===this.data.ty&&(this.layerInterface.textInterface=TextExpressionInterface(this))},BaseElement.prototype.setBlendMode=function(){var t="";switch(this.data.bm){case 1:t="multiply";break;case 2:t="screen";break;case 3:t="overlay";break;case 4:t="darken";break;case 5:t="lighten";break;case 6:t="color-dodge";break;case 7:t="color-burn";break;case 8:t="hard-light";break;case 9:t="soft-light";break;case 10:t="difference";break;case 11:t="exclusion";break;case 12:t="hue";break;case 13:t="saturation";break;case 14:t="color";break;case 15:t="luminosity"}var e=this.baseElement||this.layerElement;e.style["mix-blend-mode"]=t},BaseElement.prototype.init=function(){this.data.sr||(this.data.sr=1),this.dynamicProperties=this.dynamicProperties||[],this.data.ef&&(this.effects=new EffectsManager(this.data,this,this.dynamicProperties)),this.hidden=!1,this.firstFrame=!0,this.isVisible=!1,this._isParent=!1,this.currentFrameNum=-99999,this.lastNum=-99999,this.data.ks&&(this.finalTransform={mProp:TransformPropertyFactory.getTransformProperty(this,this.data.ks,this.dynamicProperties),matMdf:!1,opMdf:!1,mat:new Matrix,opacity:1},this.data.ao&&(this.finalTransform.mProp.autoOriented=!0),this.finalTransform.op=this.finalTransform.mProp.o,this.transform=this.finalTransform.mProp,11!==this.data.ty&&this.createElements(),this.data.hasMask&&this.addMasks(this.data)),this.elemMdf=!1},BaseElement.prototype.getType=function(){return this.type},BaseElement.prototype.resetHierarchy=function(){this.hierarchy?this.hierarchy.length=0:this.hierarchy=[]},BaseElement.prototype.getHierarchy=function(){return this.hierarchy||(this.hierarchy=[]),this.hierarchy},BaseElement.prototype.setHierarchy=function(t){this.hierarchy=t},BaseElement.prototype.getLayerSize=function(){return 5===this.data.ty?{w:this.data.textData.width,h:this.data.textData.height}:{w:this.data.width,h:this.data.height}},BaseElement.prototype.hide=function(){},BaseElement.prototype.sourceRectAtTime=function(){return{top:0,left:0,width:100,height:100}},BaseElement.prototype.mHelper=new Matrix,createElement(BaseElement,SVGBaseElement),SVGBaseElement.prototype.createElements=function(){this.layerElement=document.createElementNS(svgNS,"g"),this.transformedElement=this.layerElement,this.data.hasMask&&(this.maskedElement=this.layerElement);var t=null;if(this.data.td){if(3==this.data.td||1==this.data.td){var e=document.createElementNS(svgNS,"mask");if(e.setAttribute("id",this.layerId),e.setAttribute("mask-type",3==this.data.td?"luminance":"alpha"),e.appendChild(this.layerElement),t=e,this.globalData.defs.appendChild(e),!featureSupport.maskType&&1==this.data.td){e.setAttribute("mask-type","luminance");var r=randomString(10),s=filtersFactory.createFilter(r);this.globalData.defs.appendChild(s),s.appendChild(filtersFactory.createAlphaToLuminanceFilter());var i=document.createElementNS(svgNS,"g");i.appendChild(this.layerElement),t=i,e.appendChild(i),i.setAttribute("filter","url("+locationHref+"#"+r+")")}}else if(2==this.data.td){var a=document.createElementNS(svgNS,"mask");a.setAttribute("id",this.layerId),a.setAttribute("mask-type","alpha");var n=document.createElementNS(svgNS,"g");a.appendChild(n);var r=randomString(10),s=filtersFactory.createFilter(r),o=document.createElementNS(svgNS,"feColorMatrix");o.setAttribute("type","matrix"),o.setAttribute("color-interpolation-filters","sRGB"),o.setAttribute("values","1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 -1 1"),s.appendChild(o),this.globalData.defs.appendChild(s);var h=document.createElementNS(svgNS,"rect");if(h.setAttribute("width",this.comp.data.w),h.setAttribute("height",this.comp.data.h),h.setAttribute("x","0"),h.setAttribute("y","0"),h.setAttribute("fill","#ffffff"),h.setAttribute("opacity","0"),n.setAttribute("filter","url("+locationHref+"#"+r+")"),n.appendChild(h),n.appendChild(this.layerElement),t=n,!featureSupport.maskType){a.setAttribute("mask-type","luminance"),s.appendChild(filtersFactory.createAlphaToLuminanceFilter());var i=document.createElementNS(svgNS,"g");n.appendChild(h),i.appendChild(this.layerElement),t=i,n.appendChild(i)}this.globalData.defs.appendChild(a)}}else(this.data.hasMask||this.data.tt)&&this.data.tt?(this.matteElement=document.createElementNS(svgNS,"g"),this.matteElement.appendChild(this.layerElement),t=this.matteElement,this.baseElement=this.matteElement):this.baseElement=this.layerElement;if(!this.data.ln&&!this.data.cl||4!==this.data.ty&&0!==this.data.ty||(this.data.ln&&this.layerElement.setAttribute("id",this.data.ln),this.data.cl&&this.layerElement.setAttribute("class",this.data.cl)),0===this.data.ty){var l=document.createElementNS(svgNS,"clipPath"),p=document.createElementNS(svgNS,"path");p.setAttribute("d","M0,0 L"+this.data.w+",0 L"+this.data.w+","+this.data.h+" L0,"+this.data.h+"z");var m="cp_"+randomString(8);if(l.setAttribute("id",m),l.appendChild(p),this.globalData.defs.appendChild(l),this.checkMasks()){var f=document.createElementNS(svgNS,"g");f.setAttribute("clip-path","url("+locationHref+"#"+m+")"),f.appendChild(this.layerElement),this.transformedElement=f,t?t.appendChild(this.transformedElement):this.baseElement=this.transformedElement}else this.layerElement.setAttribute("clip-path","url("+locationHref+"#"+m+")")}0!==this.data.bm&&this.setBlendMode(),this.layerElement!==this.parentContainer&&(this.placeholder=null),this.data.ef&&(this.effectsManager=new SVGEffects(this)),this.checkParenting()},SVGBaseElement.prototype.setBlendMode=BaseElement.prototype.setBlendMode,SVGBaseElement.prototype.renderFrame=function(t){if(3===this.data.ty||this.data.hd||!this.isVisible)return!1;this.lastNum=this.currentFrameNum,this.finalTransform.opMdf=this.firstFrame||this.finalTransform.op.mdf,this.finalTransform.matMdf=this.firstFrame||this.finalTransform.mProp.mdf,this.finalTransform.opacity=this.finalTransform.op.v;var e,r=this.finalTransform.mat;if(this.hierarchy){var s=0,i=this.hierarchy.length;if(!this.finalTransform.matMdf)for(;i>s;){if(this.hierarchy[s].finalTransform.mProp.mdf){this.finalTransform.matMdf=!0;break}s+=1}if(this.finalTransform.matMdf)for(e=this.finalTransform.mProp.v.props,r.cloneFromProps(e),s=0;i>s;s+=1)e=this.hierarchy[s].finalTransform.mProp.v.props,r.transform(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],e[11],e[12],e[13],e[14],e[15])}else this.isVisible&&(r=this.finalTransform.mProp.v);return this.finalTransform.matMdf&&this.layerElement&&this.transformedElement.setAttribute("transform",r.to2dCSS()),this.finalTransform.opMdf&&this.layerElement&&(this.finalTransform.op.v<=0?!this.isTransparent&&this.globalData.renderConfig.hideOnTransparent&&(this.isTransparent=!0,this.hide()):this.hidden&&this.isTransparent&&(this.isTransparent=!1,this.show()),this.transformedElement.setAttribute("opacity",this.finalTransform.op.v)),this.data.hasMask&&this.maskManager.renderFrame(r),this.effectsManager&&this.effectsManager.renderFrame(this.firstFrame),this.isVisible},SVGBaseElement.prototype.destroy=function(){this.layerElement=null,this.parentContainer=null,this.matteElement&&(this.matteElement=null),this.maskManager&&this.maskManager.destroy()},SVGBaseElement.prototype.getBaseElement=function(){return this.baseElement},SVGBaseElement.prototype.addMasks=function(t){this.maskManager=new MaskElement(t,this,this.globalData)},SVGBaseElement.prototype.setMatte=function(t){this.matteElement&&this.matteElement.setAttribute("mask","url("+locationHref+"#"+t+")")},SVGBaseElement.prototype.hide=function(){this.hidden||(this.layerElement.style.display="none",this.hidden=!0)},SVGBaseElement.prototype.show=function(){this.isVisible&&!this.isTransparent&&(this.hidden=!1,this.layerElement.style.display="block")},createElement(SVGBaseElement,IShapeElement),IShapeElement.prototype.identityMatrix=new Matrix,IShapeElement.prototype.lcEnum={1:"butt",2:"round",3:"square"},IShapeElement.prototype.ljEnum={1:"miter",2:"round",3:"butt"},IShapeElement.prototype.searchProcessedElement=function(t){for(var e=this.processedElements.length;e;)if(e-=1,this.processedElements[e].elem===t)return this.processedElements[e].pos;return 0},IShapeElement.prototype.addProcessedElement=function(t,e){for(var r=this.processedElements.length;r;)if(r-=1,this.processedElements[r].elem===t){this.processedElements[r].pos=e;break}0===r&&this.processedElements.push({elem:t,pos:e})},IShapeElement.prototype.buildExpressionInterface=function(){},IShapeElement.prototype.createElements=function(){this._parent.createElements.call(this),this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.layerElement,this.dynamicProperties,0,[],!0),(!this.data.hd||this.data.td)&&styleUnselectableDiv(this.layerElement)},IShapeElement.prototype.setGradientData=function(t,e,r){var s,i="gr_"+randomString(10);s=1===e.t?document.createElementNS(svgNS,"linearGradient"):document.createElementNS(svgNS,"radialGradient"),s.setAttribute("id",i),s.setAttribute("spreadMethod","pad"),s.setAttribute("gradientUnits","userSpaceOnUse");var a,n,o,h=[];for(o=4*e.g.p,n=0;o>n;n+=4)a=document.createElementNS(svgNS,"stop"),s.appendChild(a),h.push(a);t.setAttribute("gf"===e.ty?"fill":"stroke","url(#"+i+")"),this.globalData.defs.appendChild(s),r.gf=s,r.cst=h},IShapeElement.prototype.setGradientOpacity=function(t,e,r){if(t.g.k.k[0].s&&t.g.k.k[0].s.length>4*t.g.p||t.g.k.k.length>4*t.g.p){var s,i,a,n,o=document.createElementNS(svgNS,"mask"),h=document.createElementNS(svgNS,"path");o.appendChild(h);var l="op_"+randomString(10),p="mk_"+randomString(10);o.setAttribute("id",p),s=1===t.t?document.createElementNS(svgNS,"linearGradient"):document.createElementNS(svgNS,"radialGradient"),s.setAttribute("id",l),s.setAttribute("spreadMethod","pad"),s.setAttribute("gradientUnits","userSpaceOnUse"),n=t.g.k.k[0].s?t.g.k.k[0].s.length:t.g.k.k.length;var m=[];for(a=4*t.g.p;n>a;a+=2)i=document.createElementNS(svgNS,"stop"),i.setAttribute("stop-color","rgb(255,255,255)"),s.appendChild(i),m.push(i);return h.setAttribute("gf"===t.ty?"fill":"stroke","url(#"+l+")"),this.globalData.defs.appendChild(s),this.globalData.defs.appendChild(o),e.of=s,e.ost=m,r.msElem=h,p}},IShapeElement.prototype.createStyleElement=function(t,e,r){var s={},i={data:t,type:t.ty,d:"",ld:"",lvl:e,mdf:!1,closed:!1},a=document.createElementNS(svgNS,"path");if(s.o=PropertyFactory.getProp(this,t.o,0,.01,r),("st"==t.ty||"gs"==t.ty)&&(a.setAttribute("stroke-linecap",this.lcEnum[t.lc]||"round"),a.setAttribute("stroke-linejoin",this.ljEnum[t.lj]||"round"),a.setAttribute("fill-opacity","0"),1==t.lj&&a.setAttribute("stroke-miterlimit",t.ml),s.w=PropertyFactory.getProp(this,t.w,0,null,r),t.d)){var n=new DashProperty(this,t.d,"svg",r);n.k||(a.setAttribute("stroke-dasharray",n.dasharray),a.setAttribute("stroke-dashoffset",n.dashoffset[0])),s.d=n}if("fl"==t.ty||"st"==t.ty)s.c=PropertyFactory.getProp(this,t.c,1,255,r);else{s.g=new GradientProperty(this,t.g,r),2==t.t&&(s.h=PropertyFactory.getProp(this,t.h,0,.01,r),s.a=PropertyFactory.getProp(this,t.a,0,degToRads,r)),s.s=PropertyFactory.getProp(this,t.s,1,null,r),s.e=PropertyFactory.getProp(this,t.e,1,null,r),this.setGradientData(a,t,s,i);var o=this.setGradientOpacity(t,s,i);o&&a.setAttribute("mask","url(#"+o+")")}return s.elem=a,2===t.r&&a.setAttribute("fill-rule","evenodd"),t.ln&&a.setAttribute("id",t.ln),t.cl&&a.setAttribute("class",t.cl),i.pElem=a,this.stylesList.push(i),s.style=i,s},IShapeElement.prototype.createGroupElement=function(t){var e={it:[],prevViewData:[]},r=document.createElementNS(svgNS,"g");return e.gr=r,t.ln&&e.gr.setAttribute("id",t.ln),e},IShapeElement.prototype.createTransformElement=function(t,e){var r={transform:{op:PropertyFactory.getProp(this,t.o,0,.01,e),mProps:TransformPropertyFactory.getTransformProperty(this,t,e)},elements:[]};return r},IShapeElement.prototype.createShapeElement=function(t,e,r,s){var i={elements:[],caches:[],styles:[],transformers:e,lStr:""},a=4;return"rc"==t.ty?a=5:"el"==t.ty?a=6:"sr"==t.ty&&(a=7),i.sh=ShapePropertyFactory.getShapeProp(this,t,a,s),i.lvl=r,this.shapes.push(i.sh),this.addShapeToModifiers(i),i};var cont=0;IShapeElement.prototype.setElementStyles=function(){var t,e=this.stylesList.length,r=[];for(t=0;e>t;t+=1)this.stylesList[t].closed||r.push(this.stylesList[t]);return r},IShapeElement.prototype.reloadShapes=function(){this.firstFrame=!0;var t,e=this.itemsData.length;for(t=0;e>t;t+=1)this.prevViewData[t]=this.itemsData[t];this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.layerElement,this.dynamicProperties,0,[],!0);var t,e=this.dynamicProperties.length;for(t=0;e>t;t+=1)this.dynamicProperties[t].getValue();this.renderModifiers()},IShapeElement.prototype.searchShapes=function(t,e,r,s,i,a,n,o){var h,l,p,m,f,c,d=[].concat(n),u=t.length-1,y=[],g=[];for(h=u;h>=0;h-=1){if(c=this.searchProcessedElement(t[h]),c?e[h]=r[c-1]:t[h]._render=o,"fl"==t[h].ty||"st"==t[h].ty||"gf"==t[h].ty||"gs"==t[h].ty)c?e[h].style.closed=!1:e[h]=this.createStyleElement(t[h],a,i),t[h]._render&&s.appendChild(e[h].elem),y.push(e[h].style);else if("gr"==t[h].ty){if(c)for(p=e[h].it.length,l=0;p>l;l+=1)e[h].prevViewData[l]=e[h].it[l];else e[h]=this.createGroupElement(t[h]);this.searchShapes(t[h].it,e[h].it,e[h].prevViewData,e[h].gr,i,a+1,d,o),t[h]._render&&s.appendChild(e[h].gr)}else"tr"==t[h].ty?(c||(e[h]=this.createTransformElement(t[h],i)),m=e[h].transform,d.push(m)):"sh"==t[h].ty||"rc"==t[h].ty||"el"==t[h].ty||"sr"==t[h].ty?(c||(e[h]=this.createShapeElement(t[h],d,a,i)),e[h].elements=this.setElementStyles()):"tm"==t[h].ty||"rd"==t[h].ty||"ms"==t[h].ty?(c?(f=e[h],f.closed=!1):(f=ShapeModifiers.getModifier(t[h].ty),f.init(this,t[h],i),e[h]=f,this.shapeModifiers.push(f)),g.push(f)):"rp"==t[h].ty&&(c?(f=e[h],f.closed=!0):(f=ShapeModifiers.getModifier(t[h].ty),e[h]=f,f.init(this,t,h,e,i),this.shapeModifiers.push(f),o=!1),g.push(f));this.addProcessedElement(t[h],h+1)}for(u=y.length,h=0;u>h;h+=1)y[h].closed=!0;for(u=g.length,h=0;u>h;h+=1)g[h].closed=!0},IShapeElement.prototype.addShapeToModifiers=function(t){var e,r=this.shapeModifiers.length;for(e=0;r>e;e+=1)this.shapeModifiers[e].addShape(t)},IShapeElement.prototype.renderModifiers=function(){if(this.shapeModifiers.length){var t,e=this.shapes.length;for(t=0;e>t;t+=1)this.shapes[t].reset();for(e=this.shapeModifiers.length,t=e-1;t>=0;t-=1)this.shapeModifiers[t].processShapes(this.firstFrame)}},IShapeElement.prototype.renderFrame=function(t){var e=this._parent.renderFrame.call(this,t);if(e===!1)return void this.hide();this.hidden&&(this.layerElement.style.display="block",this.hidden=!1),this.renderModifiers();var r,s=this.stylesList.length;for(r=0;s>r;r+=1)this.stylesList[r].d="",this.stylesList[r].mdf=!1;for(this.renderShape(this.shapesData,this.itemsData,null),r=0;s>r;r+=1)"0"===this.stylesList[r].ld&&(this.stylesList[r].ld="1",this.stylesList[r].pElem.style.display="block"),(this.stylesList[r].mdf||this.firstFrame)&&(this.stylesList[r].pElem.setAttribute("d",this.stylesList[r].d),this.stylesList[r].msElem&&this.stylesList[r].msElem.setAttribute("d",this.stylesList[r].d));this.firstFrame&&(this.firstFrame=!1)},IShapeElement.prototype.hide=function(){if(!this.hidden){this.layerElement.style.display="none";var t,e=this.stylesList.length;for(t=e-1;t>=0;t-=1)"0"!==this.stylesList[t].ld&&(this.stylesList[t].ld="0",this.stylesList[t].pElem.style.display="none",this.stylesList[t].pElem.parentNode&&(this.stylesList[t].parent=this.stylesList[t].pElem.parentNode));this.hidden=!0}},IShapeElement.prototype.renderShape=function(t,e,r){var s,i,a=t.length-1;for(s=a;s>=0;s-=1)i=t[s].ty,"tr"==i?((this.firstFrame||e[s].transform.op.mdf&&r)&&r.setAttribute("opacity",e[s].transform.op.v),(this.firstFrame||e[s].transform.mProps.mdf&&r)&&r.setAttribute("transform",e[s].transform.mProps.v.to2dCSS())):"sh"==i||"el"==i||"rc"==i||"sr"==i?this.renderPath(t[s],e[s]):"fl"==i?this.renderFill(t[s],e[s]):"gf"==i?this.renderGradient(t[s],e[s]):"gs"==i?(this.renderGradient(t[s],e[s]),this.renderStroke(t[s],e[s])):"st"==i?this.renderStroke(t[s],e[s]):"gr"==i&&this.renderShape(t[s].it,e[s].it,e[s].gr)},IShapeElement.prototype.buildShapeString=function(t,e,r,s){var i,a="";for(i=1;e>i;i+=1)1===i&&(a+=" M"+s.applyToPointStringified(t.v[0][0],t.v[0][1])),a+=" C"+s.applyToPointStringified(t.o[i-1][0],t.o[i-1][1])+" "+s.applyToPointStringified(t.i[i][0],t.i[i][1])+" "+s.applyToPointStringified(t.v[i][0],t.v[i][1]);return 1===e&&(a+=" M"+s.applyToPointStringified(t.v[0][0],t.v[0][1])),r&&e&&(a+=" C"+s.applyToPointStringified(t.o[i-1][0],t.o[i-1][1])+" "+s.applyToPointStringified(t.i[0][0],t.i[0][1])+" "+s.applyToPointStringified(t.v[0][0],t.v[0][1]),a+="z"),a},IShapeElement.prototype.renderPath=function(t,e){var r,s,i,a,n,o,h=e.elements.length,l=e.lvl;if(t._render)for(o=0;h>o;o+=1)if(e.elements[o].data._render){a=e.sh.mdf||this.firstFrame,i="M0 0";var p=e.sh.paths;if(s=p._length,e.elements[o].lvl<l){for(var m,f=this.mHelper.reset(),c=l-e.elements[o].lvl,d=e.transformers.length-1;c>0;)a=e.transformers[d].mProps.mdf||a,m=e.transformers[d].mProps.v.props,f.transform(m[0],m[1],m[2],m[3],m[4],m[5],m[6],m[7],m[8],m[9],m[10],m[11],m[12],m[13],m[14],m[15]),c--,d--;if(a){for(r=0;s>r;r+=1)n=p.shapes[r],n&&n._length&&(i+=this.buildShapeString(n,n._length,n.c,f));e.caches[o]=i}else i=e.caches[o]}else if(a){for(r=0;s>r;r+=1)n=p.shapes[r],n&&n._length&&(i+=this.buildShapeString(n,n._length,n.c,this.identityMatrix));e.caches[o]=i}else i=e.caches[o];e.elements[o].d+=i,e.elements[o].mdf=a||e.elements[o].mdf}else e.elements[o].mdf=!0},IShapeElement.prototype.renderFill=function(t,e){var r=e.style;(e.c.mdf||this.firstFrame)&&r.pElem.setAttribute("fill","rgb("+bm_floor(e.c.v[0])+","+bm_floor(e.c.v[1])+","+bm_floor(e.c.v[2])+")"),(e.o.mdf||this.firstFrame)&&r.pElem.setAttribute("fill-opacity",e.o.v)},IShapeElement.prototype.renderGradient=function(t,e){var r=e.gf,s=e.of,i=e.s.v,a=e.e.v;if(e.o.mdf||this.firstFrame){var n="gf"===t.ty?"fill-opacity":"stroke-opacity";e.elem.setAttribute(n,e.o.v)}if(e.s.mdf||this.firstFrame){var o=1===t.t?"x1":"cx",h="x1"===o?"y1":"cy";r.setAttribute(o,i[0]),r.setAttribute(h,i[1]),s&&(s.setAttribute(o,i[0]),s.setAttribute(h,i[1]))}var l,p,m,f;if(e.g.cmdf||this.firstFrame){l=e.cst;var c=e.g.c;for(m=l.length,p=0;m>p;p+=1)f=l[p],f.setAttribute("offset",c[4*p]+"%"),f.setAttribute("stop-color","rgb("+c[4*p+1]+","+c[4*p+2]+","+c[4*p+3]+")")}if(s&&(e.g.omdf||this.firstFrame)){l=e.ost;var d=e.g.o;for(m=l.length,p=0;m>p;p+=1)f=l[p],f.setAttribute("offset",d[2*p]+"%"),f.setAttribute("stop-opacity",d[2*p+1])}if(1===t.t)(e.e.mdf||this.firstFrame)&&(r.setAttribute("x2",a[0]),r.setAttribute("y2",a[1]),s&&(s.setAttribute("x2",a[0]),s.setAttribute("y2",a[1])));else{var u;if((e.s.mdf||e.e.mdf||this.firstFrame)&&(u=Math.sqrt(Math.pow(i[0]-a[0],2)+Math.pow(i[1]-a[1],2)),r.setAttribute("r",u),s&&s.setAttribute("r",u)),e.e.mdf||e.h.mdf||e.a.mdf||this.firstFrame){u||(u=Math.sqrt(Math.pow(i[0]-a[0],2)+Math.pow(i[1]-a[1],2)));var y=Math.atan2(a[1]-i[1],a[0]-i[0]),g=e.h.v>=1?.99:e.h.v<=-1?-.99:e.h.v,v=u*g,b=Math.cos(y+e.a.v)*v+i[0],E=Math.sin(y+e.a.v)*v+i[1];r.setAttribute("fx",b),r.setAttribute("fy",E),s&&(s.setAttribute("fx",b),s.setAttribute("fy",E))}}},IShapeElement.prototype.renderStroke=function(t,e){var r=e.style,s=e.d;s&&(s.mdf||this.firstFrame)&&(r.pElem.setAttribute("stroke-dasharray",s.dashStr),r.pElem.setAttribute("stroke-dashoffset",s.dashoffset[0])),e.c&&(e.c.mdf||this.firstFrame)&&r.pElem.setAttribute("stroke","rgb("+bm_floor(e.c.v[0])+","+bm_floor(e.c.v[1])+","+bm_floor(e.c.v[2])+")"),(e.o.mdf||this.firstFrame)&&r.pElem.setAttribute("stroke-opacity",e.o.v),(e.w.mdf||this.firstFrame)&&(r.pElem.setAttribute("stroke-width",e.w.v),r.msElem&&r.msElem.setAttribute("stroke-width",e.w.v))},IShapeElement.prototype.destroy=function(){this._parent.destroy.call(this._parent),this.shapeData=null,this.itemsData=null,this.parentContainer=null,this.placeholder=null},ITextElement.prototype.init=function(){this.lettersChangedFlag=!0,this.dynamicProperties=this.dynamicProperties||[],this.textAnimator=new TextAnimatorProperty(this.data.t,this.renderType,this),this.textProperty=new TextProperty(this,this.data.t,this.dynamicProperties),this._parent.init.call(this),this.textAnimator.searchProperties(this.dynamicProperties)},ITextElement.prototype.prepareFrame=function(t){this._parent.prepareFrame.call(this,t),(this.textProperty.mdf||this.textProperty.firstFrame)&&(this.buildNewText(),
this.textProperty.firstFrame=!1)},ITextElement.prototype.createPathShape=function(t,e){var r,s,i=e.length,a="";for(r=0;i>r;r+=1)s=e[r].ks.k,a+=this.buildShapeString(s,s.i.length,!0,t);return a},ITextElement.prototype.updateDocumentData=function(t,e){this.textProperty.updateDocumentData(t,e)},ITextElement.prototype.applyTextPropertiesToMatrix=function(t,e,r,s,i){switch(t.ps&&e.translate(t.ps[0],t.ps[1]+t.ascent,0),e.translate(0,-t.ls,0),t.j){case 1:e.translate(t.justifyOffset+(t.boxWidth-t.lineWidths[r]),0,0);break;case 2:e.translate(t.justifyOffset+(t.boxWidth-t.lineWidths[r])/2,0,0)}e.translate(s,i,0)},ITextElement.prototype.buildColor=function(t){return"rgb("+Math.round(255*t[0])+","+Math.round(255*t[1])+","+Math.round(255*t[2])+")"},ITextElement.prototype.buildShapeString=IShapeElement.prototype.buildShapeString,ITextElement.prototype.emptyProp=new LetterProps,ITextElement.prototype.destroy=function(){this._parent.destroy.call(this._parent)},createElement(SVGBaseElement,SVGTextElement),extendPrototype(ITextElement,SVGTextElement),SVGTextElement.prototype.createElements=function(){this._parent.createElements.call(this),this.data.ln&&this.layerElement.setAttribute("id",this.data.ln),this.data.cl&&this.layerElement.setAttribute("class",this.data.cl),this.data.singleShape&&!this.globalData.fontManager.chars&&(this.textContainer=document.createElementNS(svgNS,"text"))},SVGTextElement.prototype.buildNewText=function(){var t,e,r=this.textProperty.currentData;this.renderedLetters=Array.apply(null,{length:r?r.l.length:0}),r.fc?this.layerElement.setAttribute("fill",this.buildColor(r.fc)):this.layerElement.setAttribute("fill","rgba(0,0,0,0)"),r.sc&&(this.layerElement.setAttribute("stroke",this.buildColor(r.sc)),this.layerElement.setAttribute("stroke-width",r.sw)),this.layerElement.setAttribute("font-size",r.s);var s=this.globalData.fontManager.getFontByName(r.f);if(s.fClass)this.layerElement.setAttribute("class",s.fClass);else{this.layerElement.setAttribute("font-family",s.fFamily);var i=r.fWeight,a=r.fStyle;this.layerElement.setAttribute("font-style",a),this.layerElement.setAttribute("font-weight",i)}var n=r.l||[],o=this.globalData.fontManager.chars;if(e=n.length){var h,l,p=this.mHelper,m="",f=this.data.singleShape,c=0,d=0,u=!0,y=r.tr/1e3*r.s;if(f&&!o){var g=this.textContainer,v="";switch(r.j){case 1:v="end";break;case 2:v="middle";break;case 2:v="start"}g.setAttribute("text-anchor",v),g.setAttribute("letter-spacing",y);var b=r.t.split(String.fromCharCode(13));e=b.length;var d=r.ps?r.ps[1]+r.ascent:0;for(t=0;e>t;t+=1)h=this.textSpans[t]||document.createElementNS(svgNS,"tspan"),h.textContent=b[t],h.setAttribute("x",0),h.setAttribute("y",d),h.style.display="inherit",g.appendChild(h),this.textSpans[t]=h,d+=r.lh;this.layerElement.appendChild(g)}else{var E,P,x=this.textSpans.length;for(t=0;e>t;t+=1)o&&f&&0!==t||(h=x>t?this.textSpans[t]:document.createElementNS(svgNS,o?"path":"text"),t>=x&&(h.setAttribute("stroke-linecap","butt"),h.setAttribute("stroke-linejoin","round"),h.setAttribute("stroke-miterlimit","4"),this.textSpans[t]=h,this.layerElement.appendChild(h)),h.style.display="inherit"),p.reset(),o?(p.scale(r.s/100,r.s/100),f&&(n[t].n&&(c=-y,d+=r.yOffset,d+=u?1:0,u=!1),this.applyTextPropertiesToMatrix(r,p,n[t].line,c,d),c+=n[t].l||0,c+=y),P=this.globalData.fontManager.getCharData(r.t.charAt(t),s.fStyle,this.globalData.fontManager.getFontByName(r.f).fFamily),E=P&&P.data||{},l=E.shapes?E.shapes[0].it:[],f?m+=this.createPathShape(p,l):h.setAttribute("d",this.createPathShape(p,l))):(h.textContent=n[t].val,h.setAttributeNS("http://www.w3.org/XML/1998/namespace","xml:space","preserve"));f&&h.setAttribute("d",m)}for(;t<this.textSpans.length;)this.textSpans[t].style.display="none",t+=1;this._sizeChanged=!0}},SVGTextElement.prototype.sourceRectAtTime=function(t){if(this.prepareFrame(this.comp.renderedFrame-this.data.st),this.renderLetters(),this._sizeChanged){this._sizeChanged=!1;var e=this.layerElement.getBBox();this.bbox={top:e.y,left:e.x,width:e.width,height:e.height}}return this.bbox},SVGTextElement.prototype.renderLetters=function(){if(!this.data.singleShape&&(this.textAnimator.getMeasures(this.textProperty.currentData,this.lettersChangedFlag),this.lettersChangedFlag||this.textAnimator.lettersChangedFlag)){this._sizeChanged=!0;var t,e,r=this.textAnimator.renderedLetters,s=this.textProperty.currentData.l;e=s.length;var i,a;for(t=0;e>t;t+=1)s[t].n||(i=r[t],a=this.textSpans[t],i.mdf.m&&a.setAttribute("transform",i.m),i.mdf.o&&a.setAttribute("opacity",i.o),i.mdf.sw&&a.setAttribute("stroke-width",i.sw),i.mdf.sc&&a.setAttribute("stroke",i.sc),i.mdf.fc&&a.setAttribute("fill",i.fc))}},SVGTextElement.prototype.renderFrame=function(t){var e=this._parent.renderFrame.call(this,t);return e===!1?void this.hide():(this.hidden&&this.show(),this.firstFrame&&(this.firstFrame=!1),void this.renderLetters())},SVGTintFilter.prototype.renderFrame=function(t){if(t||this.filterManager.mdf){var e=this.filterManager.effectElements[0].p.v,r=this.filterManager.effectElements[1].p.v,s=this.filterManager.effectElements[2].p.v/100;this.matrixFilter.setAttribute("values",r[0]-e[0]+" 0 0 0 "+e[0]+" "+(r[1]-e[1])+" 0 0 0 "+e[1]+" "+(r[2]-e[2])+" 0 0 0 "+e[2]+" 0 0 0 "+s+" 0")}},SVGFillFilter.prototype.renderFrame=function(t){if(t||this.filterManager.mdf){var e=this.filterManager.effectElements[2].p.v,r=this.filterManager.effectElements[6].p.v;this.matrixFilter.setAttribute("values","0 0 0 0 "+e[0]+" 0 0 0 0 "+e[1]+" 0 0 0 0 "+e[2]+" 0 0 0 "+r+" 0")}},SVGStrokeEffect.prototype.initialize=function(){var t,e,r,s,i=this.elem.layerElement.children||this.elem.layerElement.childNodes;for(1===this.filterManager.effectElements[1].p.v?(s=this.elem.maskManager.masksProperties.length,r=0):(r=this.filterManager.effectElements[0].p.v-1,s=r+1),e=document.createElementNS(svgNS,"g"),e.setAttribute("fill","none"),e.setAttribute("stroke-linecap","round"),e.setAttribute("stroke-dashoffset",1),r;s>r;r+=1)t=document.createElementNS(svgNS,"path"),e.appendChild(t),this.paths.push({p:t,m:r});if(3===this.filterManager.effectElements[10].p.v){var a=document.createElementNS(svgNS,"mask"),n="stms_"+randomString(10);a.setAttribute("id",n),a.setAttribute("mask-type","alpha"),a.appendChild(e),this.elem.globalData.defs.appendChild(a);var o=document.createElementNS(svgNS,"g");o.setAttribute("mask","url("+locationHref+"#"+n+")"),i[0]&&o.appendChild(i[0]),this.elem.layerElement.appendChild(o),this.masker=a,e.setAttribute("stroke","#fff")}else if(1===this.filterManager.effectElements[10].p.v||2===this.filterManager.effectElements[10].p.v){if(2===this.filterManager.effectElements[10].p.v)for(var i=this.elem.layerElement.children||this.elem.layerElement.childNodes;i.length;)this.elem.layerElement.removeChild(i[0]);this.elem.layerElement.appendChild(e),this.elem.layerElement.removeAttribute("mask"),e.setAttribute("stroke","#fff")}this.initialized=!0,this.pathMasker=e},SVGStrokeEffect.prototype.renderFrame=function(t){this.initialized||this.initialize();var e,r,s,i=this.paths.length;for(e=0;i>e;e+=1)if(r=this.elem.maskManager.viewData[this.paths[e].m],s=this.paths[e].p,(t||this.filterManager.mdf||r.prop.mdf)&&s.setAttribute("d",r.lastPath),t||this.filterManager.effectElements[9].p.mdf||this.filterManager.effectElements[4].p.mdf||this.filterManager.effectElements[7].p.mdf||this.filterManager.effectElements[8].p.mdf||r.prop.mdf){var a;if(0!==this.filterManager.effectElements[7].p.v||100!==this.filterManager.effectElements[8].p.v){var n=Math.min(this.filterManager.effectElements[7].p.v,this.filterManager.effectElements[8].p.v)/100,o=Math.max(this.filterManager.effectElements[7].p.v,this.filterManager.effectElements[8].p.v)/100,h=s.getTotalLength();a="0 0 0 "+h*n+" ";var l,p=h*(o-n),m=1+2*this.filterManager.effectElements[4].p.v*this.filterManager.effectElements[9].p.v/100,f=Math.floor(p/m);for(l=0;f>l;l+=1)a+="1 "+2*this.filterManager.effectElements[4].p.v*this.filterManager.effectElements[9].p.v/100+" ";a+="0 "+10*h+" 0 0"}else a="1 "+2*this.filterManager.effectElements[4].p.v*this.filterManager.effectElements[9].p.v/100;s.setAttribute("stroke-dasharray",a)}if((t||this.filterManager.effectElements[4].p.mdf)&&this.pathMasker.setAttribute("stroke-width",2*this.filterManager.effectElements[4].p.v),(t||this.filterManager.effectElements[6].p.mdf)&&this.pathMasker.setAttribute("opacity",this.filterManager.effectElements[6].p.v),(1===this.filterManager.effectElements[10].p.v||2===this.filterManager.effectElements[10].p.v)&&(t||this.filterManager.effectElements[3].p.mdf)){var c=this.filterManager.effectElements[3].p.v;this.pathMasker.setAttribute("stroke","rgb("+bm_floor(255*c[0])+","+bm_floor(255*c[1])+","+bm_floor(255*c[2])+")")}},SVGTritoneFilter.prototype.renderFrame=function(t){if(t||this.filterManager.mdf){var e=this.filterManager.effectElements[0].p.v,r=this.filterManager.effectElements[1].p.v,s=this.filterManager.effectElements[2].p.v,i=s[0]+" "+r[0]+" "+e[0],a=s[1]+" "+r[1]+" "+e[1],n=s[2]+" "+r[2]+" "+e[2];this.feFuncR.setAttribute("tableValues",i),this.feFuncG.setAttribute("tableValues",a),this.feFuncB.setAttribute("tableValues",n)}},SVGProLevelsFilter.prototype.createFeFunc=function(t,e){var r=document.createElementNS(svgNS,t);return r.setAttribute("type","table"),e.appendChild(r),r},SVGProLevelsFilter.prototype.getTableValue=function(t,e,r,s,i){for(var a,n,o=0,h=256,l=Math.min(t,e),p=Math.max(t,e),m=Array.call(null,{length:h}),f=0,c=i-s,d=e-t;256>=o;)a=o/256,n=l>=a?0>d?i:s:a>=p?0>d?s:i:s+c*Math.pow((a-t)/d,1/r),m[f++]=n,o+=256/(h-1);return m.join(" ")},SVGProLevelsFilter.prototype.renderFrame=function(t){if(t||this.filterManager.mdf){var e,r=this.filterManager.effectElements;this.feFuncRComposed&&(t||r[2].p.mdf||r[3].p.mdf||r[4].p.mdf||r[5].p.mdf||r[6].p.mdf)&&(e=this.getTableValue(r[2].p.v,r[3].p.v,r[4].p.v,r[5].p.v,r[6].p.v),this.feFuncRComposed.setAttribute("tableValues",e),this.feFuncGComposed.setAttribute("tableValues",e),this.feFuncBComposed.setAttribute("tableValues",e)),this.feFuncR&&(t||r[9].p.mdf||r[10].p.mdf||r[11].p.mdf||r[12].p.mdf||r[13].p.mdf)&&(e=this.getTableValue(r[9].p.v,r[10].p.v,r[11].p.v,r[12].p.v,r[13].p.v),this.feFuncR.setAttribute("tableValues",e)),this.feFuncG&&(t||r[16].p.mdf||r[17].p.mdf||r[18].p.mdf||r[19].p.mdf||r[20].p.mdf)&&(e=this.getTableValue(r[16].p.v,r[17].p.v,r[18].p.v,r[19].p.v,r[20].p.v),this.feFuncG.setAttribute("tableValues",e)),this.feFuncB&&(t||r[23].p.mdf||r[24].p.mdf||r[25].p.mdf||r[26].p.mdf||r[27].p.mdf)&&(e=this.getTableValue(r[23].p.v,r[24].p.v,r[25].p.v,r[26].p.v,r[27].p.v),this.feFuncB.setAttribute("tableValues",e)),this.feFuncA&&(t||r[30].p.mdf||r[31].p.mdf||r[32].p.mdf||r[33].p.mdf||r[34].p.mdf)&&(e=this.getTableValue(r[30].p.v,r[31].p.v,r[32].p.v,r[33].p.v,r[34].p.v),this.feFuncA.setAttribute("tableValues",e))}},SVGDropShadowEffect.prototype.renderFrame=function(t){if(t||this.filterManager.mdf){if((t||this.filterManager.effectElements[4].p.mdf)&&this.feGaussianBlur.setAttribute("stdDeviation",this.filterManager.effectElements[4].p.v/4),t||this.filterManager.effectElements[0].p.mdf){var e=this.filterManager.effectElements[0].p.v;this.feFlood.setAttribute("flood-color",rgbToHex(Math.round(255*e[0]),Math.round(255*e[1]),Math.round(255*e[2])))}if((t||this.filterManager.effectElements[1].p.mdf)&&this.feFlood.setAttribute("flood-opacity",this.filterManager.effectElements[1].p.v/255),t||this.filterManager.effectElements[2].p.mdf||this.filterManager.effectElements[3].p.mdf){var r=this.filterManager.effectElements[3].p.v,s=(this.filterManager.effectElements[2].p.v-90)*degToRads,i=r*Math.cos(s),a=r*Math.sin(s);this.feOffset.setAttribute("dx",i),this.feOffset.setAttribute("dy",a)}}},SVGMatte3Effect.prototype.setElementAsMask=function(t,e){var r=document.createElementNS(svgNS,"mask");r.setAttribute("id",e.layerId),r.setAttribute("mask-type","alpha"),r.appendChild(e.layerElement),t.setMatte(e.layerId),e.data.hd=!1;var s=t.globalData.defs;s.appendChild(r)},SVGMatte3Effect.prototype.initialize=function(){for(var t=this.filterManager.effectElements[0].p.v,e=0,r=this.elem.comp.elements.length;r>e;)this.elem.comp.elements[e].data.ind===t&&this.setElementAsMask(this.elem,this.elem.comp.elements[e]),e+=1;this.initialized=!0},SVGMatte3Effect.prototype.renderFrame=function(){this.initialized||this.initialize()},SVGEffects.prototype.renderFrame=function(t){var e,r=this.filters.length;for(e=0;r>e;e+=1)this.filters[e].renderFrame(t)},createElement(SVGBaseElement,ICompElement),ICompElement.prototype.hide=function(){if(!this.hidden){this._parent.hide.call(this);var t,e=this.elements.length;for(t=0;e>t;t+=1)this.elements[t]&&this.elements[t].hide()}},ICompElement.prototype.prepareFrame=function(t){if(this._parent.prepareFrame.call(this,t),this.isVisible!==!1||this.data.xt){if(this.tm){var e=this.tm.v;e===this.data.op&&(e=this.data.op-1),this.renderedFrame=e}else this.renderedFrame=t/this.data.sr;var r,s=this.elements.length;for(this.completeLayers||this.checkLayers(this.renderedFrame),r=0;s>r;r+=1)(this.completeLayers||this.elements[r])&&this.elements[r].prepareFrame(this.renderedFrame-this.layers[r].st)}},ICompElement.prototype.renderFrame=function(t){var e,r=this._parent.renderFrame.call(this,t),s=this.layers.length;if(r===!1)return void this.hide();for(this.hidden&&this.show(),e=0;s>e;e+=1)(this.completeLayers||this.elements[e])&&this.elements[e].renderFrame();this.firstFrame&&(this.firstFrame=!1)},ICompElement.prototype.setElements=function(t){this.elements=t},ICompElement.prototype.getElements=function(){return this.elements},ICompElement.prototype.destroy=function(){this._parent.destroy.call(this._parent);var t,e=this.layers.length;for(t=0;e>t;t+=1)this.elements[t]&&this.elements[t].destroy()},ICompElement.prototype.checkLayers=SVGRenderer.prototype.checkLayers,ICompElement.prototype.buildItem=SVGRenderer.prototype.buildItem,ICompElement.prototype.buildAllItems=SVGRenderer.prototype.buildAllItems,ICompElement.prototype.buildElementParenting=SVGRenderer.prototype.buildElementParenting,ICompElement.prototype.createItem=SVGRenderer.prototype.createItem,ICompElement.prototype.createImage=SVGRenderer.prototype.createImage,ICompElement.prototype.createComp=SVGRenderer.prototype.createComp,ICompElement.prototype.createSolid=SVGRenderer.prototype.createSolid,ICompElement.prototype.createShape=SVGRenderer.prototype.createShape,ICompElement.prototype.createText=SVGRenderer.prototype.createText,ICompElement.prototype.createBase=SVGRenderer.prototype.createBase,ICompElement.prototype.appendElementInPos=SVGRenderer.prototype.appendElementInPos,ICompElement.prototype.checkPendingElements=SVGRenderer.prototype.checkPendingElements,ICompElement.prototype.addPendingElement=SVGRenderer.prototype.addPendingElement,createElement(SVGBaseElement,IImageElement),IImageElement.prototype.createElements=function(){var t=this.globalData.getAssetsPath(this.assetData);this._parent.createElements.call(this),this.innerElem=document.createElementNS(svgNS,"image"),this.innerElem.setAttribute("width",this.assetData.w+"px"),this.innerElem.setAttribute("height",this.assetData.h+"px"),this.innerElem.setAttribute("preserveAspectRatio","xMidYMid slice"),this.innerElem.setAttributeNS("http://www.w3.org/1999/xlink","href",t),this.maskedElement=this.innerElem,this.layerElement.appendChild(this.innerElem),this.data.ln&&this.layerElement.setAttribute("id",this.data.ln),this.data.cl&&this.layerElement.setAttribute("class",this.data.cl)},IImageElement.prototype.renderFrame=function(t){var e=this._parent.renderFrame.call(this,t);return e===!1?void this.hide():(this.hidden&&this.show(),void(this.firstFrame&&(this.firstFrame=!1)))},IImageElement.prototype.destroy=function(){this._parent.destroy.call(this._parent),this.innerElem=null},createElement(SVGBaseElement,ISolidElement),ISolidElement.prototype.createElements=function(){this._parent.createElements.call(this);var t=document.createElementNS(svgNS,"rect");t.setAttribute("width",this.data.sw),t.setAttribute("height",this.data.sh),t.setAttribute("fill",this.data.sc),this.layerElement.appendChild(t),this.innerElem=t,this.data.ln&&this.layerElement.setAttribute("id",this.data.ln),this.data.cl&&this.layerElement.setAttribute("class",this.data.cl)},ISolidElement.prototype.renderFrame=IImageElement.prototype.renderFrame,ISolidElement.prototype.destroy=IImageElement.prototype.destroy;var animationManager=function(){function t(t){for(var e=0,r=t.target;C>e;)x[e].animation===r&&(x.splice(e,1),e-=1,C-=1,r.isPaused||s()),e+=1}function e(t,e){if(!t)return null;for(var r=0;C>r;){if(x[r].elem==t&&null!==x[r].elem)return x[r].animation;r+=1}var s=new AnimationItem;return i(s,t),s.setData(t,e),s}function r(){A+=1,E()}function s(){A-=1,0===A&&(k=!0)}function i(e,i){e.addEventListener("destroy",t),e.addEventListener("_active",r),e.addEventListener("_idle",s),x.push({elem:i,animation:e}),C+=1}function a(t){var e=new AnimationItem;return i(e,null),e.setParams(t),e}function n(t,e){var r;for(r=0;C>r;r+=1)x[r].animation.setSpeed(t,e)}function o(t,e){var r;for(r=0;C>r;r+=1)x[r].animation.setDirection(t,e)}function h(t){var e;for(e=0;C>e;e+=1)x[e].animation.play(t)}function l(t,e){S=Date.now();var r;for(r=0;C>r;r+=1)x[r].animation.moveFrame(t,e)}function p(t){var e,r=t-S;for(e=0;C>e;e+=1)x[e].animation.advanceTime(r);S=t,k||window.requestAnimationFrame(p)}function m(t){S=t,window.requestAnimationFrame(p)}function f(t){var e;for(e=0;C>e;e+=1)x[e].animation.pause(t)}function c(t,e,r){var s;for(s=0;C>s;s+=1)x[s].animation.goToAndStop(t,e,r)}function d(t){var e;for(e=0;C>e;e+=1)x[e].animation.stop(t)}function u(t){var e;for(e=0;C>e;e+=1)x[e].animation.togglePause(t)}function y(t){var e;for(e=C-1;e>=0;e-=1)x[e].animation.destroy(t)}function g(t,r,s){var i,a=[].concat([].slice.call(document.getElementsByClassName("lottie")),[].slice.call(document.getElementsByClassName("bodymovin"))),n=a.length;for(i=0;n>i;i+=1)s&&a[i].setAttribute("data-bm-type",s),e(a[i],t);if(r&&0===n){s||(s="svg");var o=document.getElementsByTagName("body")[0];o.innerHTML="";var h=document.createElement("div");h.style.width="100%",h.style.height="100%",h.setAttribute("data-bm-type",s),o.appendChild(h),e(h,t)}}function v(){var t;for(t=0;C>t;t+=1)x[t].animation.resize()}function b(){window.requestAnimationFrame(m)}function E(){k&&(k=!1,window.requestAnimationFrame(m))}var P={},x=[],S=0,C=0,k=!0,A=0;return setTimeout(b,0),P.registerAnimation=e,P.loadAnimation=a,P.setSpeed=n,P.setDirection=o,P.play=h,P.moveFrame=l,P.pause=f,P.stop=d,P.togglePause=u,P.searchAnimations=g,P.resize=v,P.start=b,P.goToAndStop=c,P.destroy=y,P}(),AnimationItem=function(){this._cbs=[],this.name="",this.path="",this.isLoaded=!1,this.currentFrame=0,this.currentRawFrame=0,this.totalFrames=0,this.frameRate=0,this.frameMult=0,this.playSpeed=1,this.playDirection=1,this.pendingElements=0,this.playCount=0,this.prerenderFramesFlag=!0,this.animationData={},this.layers=[],this.assets=[],this.isPaused=!0,this.autoplay=!1,this.loop=!0,this.renderer=null,this.animationID=randomString(10),this.scaleMode="fit",this.assetsPath="",this.timeCompleted=0,this.segmentPos=0,this.subframeEnabled=subframeEnabled,this.segments=[],this.pendingSegment=!1,this._idle=!0,this.projectInterface=ProjectInterface()};AnimationItem.prototype.setParams=function(t){var e=this;t.context&&(this.context=t.context),(t.wrapper||t.container)&&(this.wrapper=t.wrapper||t.container);var r=t.animType?t.animType:t.renderer?t.renderer:"svg";switch(r){case"canvas":this.renderer=new CanvasRenderer(this,t.rendererSettings);break;case"svg":this.renderer=new SVGRenderer(this,t.rendererSettings);break;case"hybrid":case"html":default:this.renderer=new HybridRenderer(this,t.rendererSettings)}if(this.renderer.setProjectInterface(this.projectInterface),this.animType=r,""===t.loop||null===t.loop||(this.loop=t.loop===!1?!1:t.loop===!0?!0:parseInt(t.loop)),this.autoplay="autoplay"in t?t.autoplay:!0,this.name=t.name?t.name:"",this.prerenderFramesFlag="prerender"in t?t.prerender:!0,this.autoloadSegments=t.hasOwnProperty("autoloadSegments")?t.autoloadSegments:!0,t.animationData)e.configAnimation(t.animationData);else if(t.path){"json"!=t.path.substr(-4)&&("/"!=t.path.substr(-1,1)&&(t.path+="/"),t.path+="data.json");var s=new XMLHttpRequest;this.path=-1!=t.path.lastIndexOf("\\")?t.path.substr(0,t.path.lastIndexOf("\\")+1):t.path.substr(0,t.path.lastIndexOf("/")+1),this.assetsPath=t.assetsPath,this.fileName=t.path.substr(t.path.lastIndexOf("/")+1),this.fileName=this.fileName.substr(0,this.fileName.lastIndexOf(".json")),s.open("GET",t.path,!0),s.send(),s.onreadystatechange=function(){if(4==s.readyState)if(200==s.status)e.configAnimation(JSON.parse(s.responseText));else try{var t=JSON.parse(s.responseText);e.configAnimation(t)}catch(r){}}}},AnimationItem.prototype.setData=function(t,e){var r={wrapper:t,animationData:e?"object"==typeof e?e:JSON.parse(e):null},s=t.attributes;r.path=s.getNamedItem("data-animation-path")?s.getNamedItem("data-animation-path").value:s.getNamedItem("data-bm-path")?s.getNamedItem("data-bm-path").value:s.getNamedItem("bm-path")?s.getNamedItem("bm-path").value:"",r.animType=s.getNamedItem("data-anim-type")?s.getNamedItem("data-anim-type").value:s.getNamedItem("data-bm-type")?s.getNamedItem("data-bm-type").value:s.getNamedItem("bm-type")?s.getNamedItem("bm-type").value:s.getNamedItem("data-bm-renderer")?s.getNamedItem("data-bm-renderer").value:s.getNamedItem("bm-renderer")?s.getNamedItem("bm-renderer").value:"canvas";var i=s.getNamedItem("data-anim-loop")?s.getNamedItem("data-anim-loop").value:s.getNamedItem("data-bm-loop")?s.getNamedItem("data-bm-loop").value:s.getNamedItem("bm-loop")?s.getNamedItem("bm-loop").value:"";""===i||(r.loop="false"===i?!1:"true"===i?!0:parseInt(i));var a=s.getNamedItem("data-anim-autoplay")?s.getNamedItem("data-anim-autoplay").value:s.getNamedItem("data-bm-autoplay")?s.getNamedItem("data-bm-autoplay").value:s.getNamedItem("bm-autoplay")?s.getNamedItem("bm-autoplay").value:!0;r.autoplay="false"!==a,r.name=s.getNamedItem("data-name")?s.getNamedItem("data-name").value:s.getNamedItem("data-bm-name")?s.getNamedItem("data-bm-name").value:s.getNamedItem("bm-name")?s.getNamedItem("bm-name").value:"";var n=s.getNamedItem("data-anim-prerender")?s.getNamedItem("data-anim-prerender").value:s.getNamedItem("data-bm-prerender")?s.getNamedItem("data-bm-prerender").value:s.getNamedItem("bm-prerender")?s.getNamedItem("bm-prerender").value:"";"false"===n&&(r.prerender=!1),this.setParams(r)},AnimationItem.prototype.includeLayers=function(t){t.op>this.animationData.op&&(this.animationData.op=t.op,this.totalFrames=Math.floor(t.op-this.animationData.ip),this.animationData.tf=this.totalFrames);var e,r,s=this.animationData.layers,i=s.length,a=t.layers,n=a.length;for(r=0;n>r;r+=1)for(e=0;i>e;){if(s[e].id==a[r].id){s[e]=a[r];break}e+=1}if((t.chars||t.fonts)&&(this.renderer.globalData.fontManager.addChars(t.chars),this.renderer.globalData.fontManager.addFonts(t.fonts,this.renderer.globalData.defs)),t.assets)for(i=t.assets.length,e=0;i>e;e+=1)this.animationData.assets.push(t.assets[e]);this.animationData.__complete=!1,dataManager.completeData(this.animationData,this.renderer.globalData.fontManager),this.renderer.includeLayers(t.layers),expressionsPlugin&&expressionsPlugin.initExpressions(this),this.renderer.renderFrame(null),this.loadNextSegment()},AnimationItem.prototype.loadNextSegment=function(){var t=this.animationData.segments;if(!t||0===t.length||!this.autoloadSegments)return this.trigger("data_ready"),void(this.timeCompleted=this.animationData.tf);var e=t.shift();this.timeCompleted=e.time*this.frameRate;var r=new XMLHttpRequest,s=this,i=this.path+this.fileName+"_"+this.segmentPos+".json";this.segmentPos+=1,r.open("GET",i,!0),r.send(),r.onreadystatechange=function(){if(4==r.readyState)if(200==r.status)s.includeLayers(JSON.parse(r.responseText));else try{var t=JSON.parse(r.responseText);s.includeLayers(t)}catch(e){}}},AnimationItem.prototype.loadSegments=function(){var t=this.animationData.segments;t||(this.timeCompleted=this.animationData.tf),this.loadNextSegment()},AnimationItem.prototype.configAnimation=function(t){var e=this;this.renderer&&this.renderer.destroyed||(this.animationData=t,this.totalFrames=Math.floor(this.animationData.op-this.animationData.ip),this.animationData.tf=this.totalFrames,this.renderer.configAnimation(t),t.assets||(t.assets=[]),t.comps&&(t.assets=t.assets.concat(t.comps),t.comps=null),this.renderer.searchExtraCompositions(t.assets),this.layers=this.animationData.layers,this.assets=this.animationData.assets,this.frameRate=this.animationData.fr,this.firstFrame=Math.round(this.animationData.ip),this.frameMult=this.animationData.fr/1e3,this.trigger("config_ready"),this.imagePreloader=new ImagePreloader,this.imagePreloader.setAssetsPath(this.assetsPath),this.imagePreloader.setPath(this.path),this.imagePreloader.loadAssets(t.assets,function(t){t||e.trigger("loaded_images")}),this.loadSegments(),this.updaFrameModifier(),this.renderer.globalData.fontManager?this.waitForFontsLoaded():(dataManager.completeData(this.animationData,this.renderer.globalData.fontManager),this.checkLoaded()))},AnimationItem.prototype.waitForFontsLoaded=function(){function t(){this.renderer.globalData.fontManager.loaded?(dataManager.completeData(this.animationData,this.renderer.globalData.fontManager),this.checkLoaded()):setTimeout(t.bind(this),20)}return function(){t.bind(this)()}}(),AnimationItem.prototype.addPendingElement=function(){this.pendingElements+=1},AnimationItem.prototype.elementLoaded=function(){this.pendingElements--,this.checkLoaded()},AnimationItem.prototype.checkLoaded=function(){0===this.pendingElements&&(expressionsPlugin&&expressionsPlugin.initExpressions(this),this.renderer.initItems(),setTimeout(function(){this.trigger("DOMLoaded")}.bind(this),0),this.isLoaded=!0,this.gotoFrame(),this.autoplay&&this.play())},AnimationItem.prototype.resize=function(){this.renderer.updateContainerSize()},AnimationItem.prototype.setSubframe=function(t){this.subframeEnabled=t?!0:!1},AnimationItem.prototype.gotoFrame=function(){this.currentFrame=this.subframeEnabled?this.currentRawFrame:Math.floor(this.currentRawFrame),this.timeCompleted!==this.totalFrames&&this.currentFrame>this.timeCompleted&&(this.currentFrame=this.timeCompleted),this.trigger("enterFrame"),this.renderFrame()},AnimationItem.prototype.renderFrame=function(){this.isLoaded!==!1&&this.renderer.renderFrame(this.currentFrame+this.firstFrame)},AnimationItem.prototype.play=function(t){t&&this.name!=t||this.isPaused===!0&&(this.isPaused=!1,this._idle&&(this._idle=!1,this.trigger("_active")))},AnimationItem.prototype.pause=function(t){t&&this.name!=t||this.isPaused===!1&&(this.isPaused=!0,this.pendingSegment||(this._idle=!0,this.trigger("_idle")))},AnimationItem.prototype.togglePause=function(t){t&&this.name!=t||(this.isPaused===!0?this.play():this.pause())},AnimationItem.prototype.stop=function(t){t&&this.name!=t||(this.pause(),this.currentFrame=this.currentRawFrame=0,this.playCount=0,this.gotoFrame())},AnimationItem.prototype.goToAndStop=function(t,e,r){r&&this.name!=r||(this.setCurrentRawFrameValue(e?t:t*this.frameModifier),this.pause())},AnimationItem.prototype.goToAndPlay=function(t,e,r){this.goToAndStop(t,e,r),this.play()},AnimationItem.prototype.advanceTime=function(t){return this.pendingSegment?(this.pendingSegment=!1,this.adjustSegment(this.segments.shift()),void(this.isPaused&&this.play())):void(this.isPaused!==!0&&this.isLoaded!==!1&&this.setCurrentRawFrameValue(this.currentRawFrame+t*this.frameModifier))},AnimationItem.prototype.updateAnimation=function(t){this.setCurrentRawFrameValue(this.totalFrames*t)},AnimationItem.prototype.moveFrame=function(t,e){e&&this.name!=e||this.setCurrentRawFrameValue(this.currentRawFrame+t)},AnimationItem.prototype.adjustSegment=function(t){this.playCount=0,t[1]<t[0]?(this.frameModifier>0&&(this.playSpeed<0?this.setSpeed(-this.playSpeed):this.setDirection(-1)),this.totalFrames=t[0]-t[1],this.firstFrame=t[1],this.setCurrentRawFrameValue(this.totalFrames-.01)):t[1]>t[0]&&(this.frameModifier<0&&(this.playSpeed<0?this.setSpeed(-this.playSpeed):this.setDirection(1)),this.totalFrames=t[1]-t[0],this.firstFrame=t[0],this.setCurrentRawFrameValue(0)),this.trigger("segmentStart")},AnimationItem.prototype.setSegment=function(t,e){var r=-1;this.isPaused&&(this.currentRawFrame+this.firstFrame<t?r=t:this.currentRawFrame+this.firstFrame>e&&(r=e-t-.01)),this.firstFrame=t,this.totalFrames=e-t,-1!==r&&this.goToAndStop(r,!0)},AnimationItem.prototype.playSegments=function(t,e){if("object"==typeof t[0]){var r,s=t.length;for(r=0;s>r;r+=1)this.segments.push(t[r])}else this.segments.push(t);e&&this.adjustSegment(this.segments.shift()),this.isPaused&&this.play()},AnimationItem.prototype.resetSegments=function(t){this.segments.length=0,this.segments.push([this.animationData.ip*this.frameRate,Math.floor(this.animationData.op-this.animationData.ip+this.animationData.ip*this.frameRate)]),t&&this.adjustSegment(this.segments.shift())},AnimationItem.prototype.checkSegments=function(){this.segments.length&&(this.pendingSegment=!0)},AnimationItem.prototype.remove=function(t){t&&this.name!=t||this.renderer.destroy()},AnimationItem.prototype.destroy=function(t){t&&this.name!=t||this.renderer&&this.renderer.destroyed||(this.renderer.destroy(),this.trigger("destroy"),this._cbs=null,this.onEnterFrame=this.onLoopComplete=this.onComplete=this.onSegmentStart=this.onDestroy=null)},AnimationItem.prototype.setCurrentRawFrameValue=function(t){if(this.currentRawFrame=t,this.currentRawFrame>=this.totalFrames){if(this.checkSegments(),this.loop===!1)return this.currentRawFrame=this.totalFrames-.01,this.gotoFrame(),this.pause(),void this.trigger("complete");if(this.trigger("loopComplete"),this.playCount+=1,this.loop!==!0&&this.playCount==this.loop||this.pendingSegment)return this.currentRawFrame=this.totalFrames-.01,this.gotoFrame(),this.pause(),void this.trigger("complete");this.currentRawFrame=this.currentRawFrame%this.totalFrames}else if(this.currentRawFrame<0)return this.checkSegments(),this.playCount-=1,this.playCount<0&&(this.playCount=0),this.loop===!1||this.pendingSegment?(this.currentRawFrame=0,this.gotoFrame(),this.pause(),void this.trigger("complete")):(this.trigger("loopComplete"),this.currentRawFrame=(this.totalFrames+this.currentRawFrame)%this.totalFrames,void this.gotoFrame());this.gotoFrame()},AnimationItem.prototype.setSpeed=function(t){this.playSpeed=t,this.updaFrameModifier()},AnimationItem.prototype.setDirection=function(t){this.playDirection=0>t?-1:1,this.updaFrameModifier()},AnimationItem.prototype.updaFrameModifier=function(){this.frameModifier=this.frameMult*this.playSpeed*this.playDirection},AnimationItem.prototype.getPath=function(){return this.path},AnimationItem.prototype.getAssetsPath=function(t){var e="";if(this.assetsPath){var r=t.p;-1!==r.indexOf("images/")&&(r=r.split("/")[1]),e=this.assetsPath+r}else e=this.path,e+=t.u?t.u:"",e+=t.p;return e},AnimationItem.prototype.getAssetData=function(t){for(var e=0,r=this.assets.length;r>e;){if(t==this.assets[e].id)return this.assets[e];e+=1}},AnimationItem.prototype.hide=function(){this.renderer.hide()},AnimationItem.prototype.show=function(){this.renderer.show()},AnimationItem.prototype.getAssets=function(){return this.assets},AnimationItem.prototype.trigger=function(t){if(this._cbs&&this._cbs[t])switch(t){case"enterFrame":this.triggerEvent(t,new BMEnterFrameEvent(t,this.currentFrame,this.totalFrames,this.frameMult));break;case"loopComplete":this.triggerEvent(t,new BMCompleteLoopEvent(t,this.loop,this.playCount,this.frameMult));break;case"complete":this.triggerEvent(t,new BMCompleteEvent(t,this.frameMult));break;case"segmentStart":this.triggerEvent(t,new BMSegmentStartEvent(t,this.firstFrame,this.totalFrames));break;case"destroy":this.triggerEvent(t,new BMDestroyEvent(t,this));break;default:this.triggerEvent(t)}"enterFrame"===t&&this.onEnterFrame&&this.onEnterFrame.call(this,new BMEnterFrameEvent(t,this.currentFrame,this.totalFrames,this.frameMult)),
"loopComplete"===t&&this.onLoopComplete&&this.onLoopComplete.call(this,new BMCompleteLoopEvent(t,this.loop,this.playCount,this.frameMult)),"complete"===t&&this.onComplete&&this.onComplete.call(this,new BMCompleteEvent(t,this.frameMult)),"segmentStart"===t&&this.onSegmentStart&&this.onSegmentStart.call(this,new BMSegmentStartEvent(t,this.firstFrame,this.totalFrames)),"destroy"===t&&this.onDestroy&&this.onDestroy.call(this,new BMDestroyEvent(t,this))},AnimationItem.prototype.addEventListener=_addEventListener,AnimationItem.prototype.removeEventListener=_removeEventListener,AnimationItem.prototype.triggerEvent=_triggerEvent,extendPrototype(BaseRenderer,CanvasRenderer),CanvasRenderer.prototype.createBase=function(t){return new CVBaseElement(t,this,this.globalData)},CanvasRenderer.prototype.createShape=function(t){return new CVShapeElement(t,this,this.globalData)},CanvasRenderer.prototype.createText=function(t){return new CVTextElement(t,this,this.globalData)},CanvasRenderer.prototype.createImage=function(t){return new CVImageElement(t,this,this.globalData)},CanvasRenderer.prototype.createComp=function(t){return new CVCompElement(t,this,this.globalData)},CanvasRenderer.prototype.createSolid=function(t){return new CVSolidElement(t,this,this.globalData)},CanvasRenderer.prototype.ctxTransform=function(t){if(1!==t[0]||0!==t[1]||0!==t[4]||1!==t[5]||0!==t[12]||0!==t[13]){if(!this.renderConfig.clearCanvas)return void this.canvasContext.transform(t[0],t[1],t[4],t[5],t[12],t[13]);this.transformMat.cloneFromProps(t),this.transformMat.transform(this.contextData.cTr.props[0],this.contextData.cTr.props[1],this.contextData.cTr.props[2],this.contextData.cTr.props[3],this.contextData.cTr.props[4],this.contextData.cTr.props[5],this.contextData.cTr.props[6],this.contextData.cTr.props[7],this.contextData.cTr.props[8],this.contextData.cTr.props[9],this.contextData.cTr.props[10],this.contextData.cTr.props[11],this.contextData.cTr.props[12],this.contextData.cTr.props[13],this.contextData.cTr.props[14],this.contextData.cTr.props[15]),this.contextData.cTr.cloneFromProps(this.transformMat.props);var e=this.contextData.cTr.props;this.canvasContext.setTransform(e[0],e[1],e[4],e[5],e[12],e[13])}},CanvasRenderer.prototype.ctxOpacity=function(t){if(1!==t){if(!this.renderConfig.clearCanvas)return void(this.canvasContext.globalAlpha*=0>t?0:t);this.contextData.cO*=0>t?0:t,this.canvasContext.globalAlpha=this.contextData.cO}},CanvasRenderer.prototype.reset=function(){return this.renderConfig.clearCanvas?(this.contextData.cArrPos=0,this.contextData.cTr.reset(),void(this.contextData.cO=1)):void this.canvasContext.restore()},CanvasRenderer.prototype.save=function(t){if(!this.renderConfig.clearCanvas)return void this.canvasContext.save();t&&this.canvasContext.save();var e=this.contextData.cTr.props;(null===this.contextData.saved[this.contextData.cArrPos]||void 0===this.contextData.saved[this.contextData.cArrPos])&&(this.contextData.saved[this.contextData.cArrPos]=new Array(16));var r,s=this.contextData.saved[this.contextData.cArrPos];for(r=0;16>r;r+=1)s[r]=e[r];this.contextData.savedOp[this.contextData.cArrPos]=this.contextData.cO,this.contextData.cArrPos+=1},CanvasRenderer.prototype.restore=function(t){if(!this.renderConfig.clearCanvas)return void this.canvasContext.restore();t&&this.canvasContext.restore(),this.contextData.cArrPos-=1;var e,r=this.contextData.saved[this.contextData.cArrPos],s=this.contextData.cTr.props;for(e=0;16>e;e+=1)s[e]=r[e];this.canvasContext.setTransform(r[0],r[1],r[4],r[5],r[12],r[13]),r=this.contextData.savedOp[this.contextData.cArrPos],this.contextData.cO=r,this.canvasContext.globalAlpha=r},CanvasRenderer.prototype.configAnimation=function(t){this.animationItem.wrapper?(this.animationItem.container=document.createElement("canvas"),this.animationItem.container.style.width="100%",this.animationItem.container.style.height="100%",this.animationItem.container.style.transformOrigin=this.animationItem.container.style.mozTransformOrigin=this.animationItem.container.style.webkitTransformOrigin=this.animationItem.container.style["-webkit-transform"]="0px 0px 0px",this.animationItem.wrapper.appendChild(this.animationItem.container),this.canvasContext=this.animationItem.container.getContext("2d"),this.renderConfig.className&&this.animationItem.container.setAttribute("class",this.renderConfig.className)):this.canvasContext=this.renderConfig.context,this.data=t,this.globalData.canvasContext=this.canvasContext,this.globalData.renderer=this,this.globalData.isDashed=!1,this.globalData.totalFrames=Math.floor(t.tf),this.globalData.compWidth=t.w,this.globalData.compHeight=t.h,this.globalData.frameRate=t.fr,this.globalData.frameId=0,this.globalData.compSize={w:t.w,h:t.h},this.globalData.progressiveLoad=this.renderConfig.progressiveLoad,this.layers=t.layers,this.transformCanvas={},this.transformCanvas.w=t.w,this.transformCanvas.h=t.h,this.globalData.fontManager=new FontManager,this.globalData.fontManager.addChars(t.chars),this.globalData.fontManager.addFonts(t.fonts,document.body),this.globalData.getAssetData=this.animationItem.getAssetData.bind(this.animationItem),this.globalData.getAssetsPath=this.animationItem.getAssetsPath.bind(this.animationItem),this.globalData.elementLoaded=this.animationItem.elementLoaded.bind(this.animationItem),this.globalData.addPendingElement=this.animationItem.addPendingElement.bind(this.animationItem),this.globalData.transformCanvas=this.transformCanvas,this.elements=Array.apply(null,{length:t.layers.length}),this.updateContainerSize()},CanvasRenderer.prototype.updateContainerSize=function(){var t,e;this.animationItem.wrapper&&this.animationItem.container?(t=this.animationItem.wrapper.offsetWidth,e=this.animationItem.wrapper.offsetHeight,this.animationItem.container.setAttribute("width",t*this.renderConfig.dpr),this.animationItem.container.setAttribute("height",e*this.renderConfig.dpr)):(t=this.canvasContext.canvas.width*this.renderConfig.dpr,e=this.canvasContext.canvas.height*this.renderConfig.dpr);var r,s;if(-1!==this.renderConfig.preserveAspectRatio.indexOf("meet")||-1!==this.renderConfig.preserveAspectRatio.indexOf("slice")){var i=this.renderConfig.preserveAspectRatio.split(" "),a=i[1]||"meet",n=i[0]||"xMidYMid",o=n.substr(0,4),h=n.substr(4);r=t/e,s=this.transformCanvas.w/this.transformCanvas.h,s>r&&"meet"===a||r>s&&"slice"===a?(this.transformCanvas.sx=t/(this.transformCanvas.w/this.renderConfig.dpr),this.transformCanvas.sy=t/(this.transformCanvas.w/this.renderConfig.dpr)):(this.transformCanvas.sx=e/(this.transformCanvas.h/this.renderConfig.dpr),this.transformCanvas.sy=e/(this.transformCanvas.h/this.renderConfig.dpr)),this.transformCanvas.tx="xMid"===o&&(r>s&&"meet"===a||s>r&&"slice"===a)?(t-this.transformCanvas.w*(e/this.transformCanvas.h))/2*this.renderConfig.dpr:"xMax"===o&&(r>s&&"meet"===a||s>r&&"slice"===a)?(t-this.transformCanvas.w*(e/this.transformCanvas.h))*this.renderConfig.dpr:0,this.transformCanvas.ty="YMid"===h&&(s>r&&"meet"===a||r>s&&"slice"===a)?(e-this.transformCanvas.h*(t/this.transformCanvas.w))/2*this.renderConfig.dpr:"YMax"===h&&(s>r&&"meet"===a||r>s&&"slice"===a)?(e-this.transformCanvas.h*(t/this.transformCanvas.w))*this.renderConfig.dpr:0}else"none"==this.renderConfig.preserveAspectRatio?(this.transformCanvas.sx=t/(this.transformCanvas.w/this.renderConfig.dpr),this.transformCanvas.sy=e/(this.transformCanvas.h/this.renderConfig.dpr),this.transformCanvas.tx=0,this.transformCanvas.ty=0):(this.transformCanvas.sx=this.renderConfig.dpr,this.transformCanvas.sy=this.renderConfig.dpr,this.transformCanvas.tx=0,this.transformCanvas.ty=0);this.transformCanvas.props=[this.transformCanvas.sx,0,0,0,0,this.transformCanvas.sy,0,0,0,0,1,0,this.transformCanvas.tx,this.transformCanvas.ty,0,1];var l,p=this.elements.length;for(l=0;p>l;l+=1)this.elements[l]&&0===this.elements[l].data.ty&&this.elements[l].resize(this.globalData.transformCanvas)},CanvasRenderer.prototype.destroy=function(){this.renderConfig.clearCanvas&&(this.animationItem.wrapper.innerHTML="");var t,e=this.layers?this.layers.length:0;for(t=e-1;t>=0;t-=1)this.elements[t]&&this.elements[t].destroy();this.elements.length=0,this.globalData.canvasContext=null,this.animationItem.container=null,this.destroyed=!0},CanvasRenderer.prototype.renderFrame=function(t){if(!(this.renderedFrame==t&&this.renderConfig.clearCanvas===!0||this.destroyed||null===t)){this.renderedFrame=t,this.globalData.frameNum=t-this.animationItem.firstFrame,this.globalData.frameId+=1,this.globalData.projectInterface.currentFrame=t,this.renderConfig.clearCanvas===!0?(this.reset(),this.canvasContext.save(),this.canvasContext.clearRect(this.transformCanvas.tx,this.transformCanvas.ty,this.transformCanvas.w*this.transformCanvas.sx,this.transformCanvas.h*this.transformCanvas.sy)):this.save(),this.ctxTransform(this.transformCanvas.props),this.canvasContext.beginPath(),this.canvasContext.rect(0,0,this.transformCanvas.w,this.transformCanvas.h),this.canvasContext.closePath(),this.canvasContext.clip();var e,r=this.layers.length;for(this.completeLayers||this.checkLayers(t),e=0;r>e;e++)(this.completeLayers||this.elements[e])&&this.elements[e].prepareFrame(t-this.layers[e].st);for(e=r-1;e>=0;e-=1)(this.completeLayers||this.elements[e])&&this.elements[e].renderFrame();this.renderConfig.clearCanvas!==!0?this.restore():this.canvasContext.restore()}},CanvasRenderer.prototype.buildItem=function(t){var e=this.elements;if(!e[t]&&99!=this.layers[t].ty){var r=this.createItem(this.layers[t],this,this.globalData);e[t]=r,r.initExpressions(),0===this.layers[t].ty&&r.resize(this.globalData.transformCanvas)}},CanvasRenderer.prototype.checkPendingElements=function(){for(;this.pendingElements.length;){var t=this.pendingElements.pop();t.checkParenting()}},CanvasRenderer.prototype.hide=function(){this.animationItem.container.style.display="none"},CanvasRenderer.prototype.show=function(){this.animationItem.container.style.display="block"},CanvasRenderer.prototype.searchExtraCompositions=function(t){{var e,r=t.length;document.createElementNS(svgNS,"g")}for(e=0;r>e;e+=1)if(t[e].xt){var s=this.createComp(t[e],this.globalData.comp,this.globalData);s.initExpressions(),this.globalData.projectInterface.registerComposition(s)}},extendPrototype(BaseRenderer,HybridRenderer),HybridRenderer.prototype.buildItem=SVGRenderer.prototype.buildItem,HybridRenderer.prototype.checkPendingElements=function(){for(;this.pendingElements.length;){var t=this.pendingElements.pop();t.checkParenting()}},HybridRenderer.prototype.appendElementInPos=function(t,e){var r=t.getBaseElement();if(r){var s=this.layers[e];if(s.ddd&&this.supports3d)this.addTo3dContainer(r,e);else{for(var i,a,n=0;e>n;)this.elements[n]&&this.elements[n]!==!0&&this.elements[n].getBaseElement&&(a=this.elements[n],i=this.layers[n].ddd?this.getThreeDContainerByPos(n):a.getBaseElement()),n+=1;i?s.ddd&&this.supports3d||this.layerElement.insertBefore(r,i):s.ddd&&this.supports3d||this.layerElement.appendChild(r)}}},HybridRenderer.prototype.createBase=function(t){return new SVGBaseElement(t,this.layerElement,this.globalData,this)},HybridRenderer.prototype.createShape=function(t){return this.supports3d?new HShapeElement(t,this.layerElement,this.globalData,this):new IShapeElement(t,this.layerElement,this.globalData,this)},HybridRenderer.prototype.createText=function(t){return this.supports3d?new HTextElement(t,this.layerElement,this.globalData,this):new SVGTextElement(t,this.layerElement,this.globalData,this)},HybridRenderer.prototype.createCamera=function(t){return this.camera=new HCameraElement(t,this.layerElement,this.globalData,this),this.camera},HybridRenderer.prototype.createImage=function(t){return this.supports3d?new HImageElement(t,this.layerElement,this.globalData,this):new IImageElement(t,this.layerElement,this.globalData,this)},HybridRenderer.prototype.createComp=function(t){return this.supports3d?new HCompElement(t,this.layerElement,this.globalData,this):new ICompElement(t,this.layerElement,this.globalData,this)},HybridRenderer.prototype.createSolid=function(t){return this.supports3d?new HSolidElement(t,this.layerElement,this.globalData,this):new ISolidElement(t,this.layerElement,this.globalData,this)},HybridRenderer.prototype.getThreeDContainerByPos=function(t){for(var e=0,r=this.threeDElements.length;r>e;){if(this.threeDElements[e].startPos<=t&&this.threeDElements[e].endPos>=t)return this.threeDElements[e].perspectiveElem;e+=1}},HybridRenderer.prototype.createThreeDContainer=function(t){var e=document.createElement("div");styleDiv(e),e.style.width=this.globalData.compSize.w+"px",e.style.height=this.globalData.compSize.h+"px",e.style.transformOrigin=e.style.mozTransformOrigin=e.style.webkitTransformOrigin="50% 50%";var r=document.createElement("div");styleDiv(r),r.style.transform=r.style.webkitTransform="matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)",e.appendChild(r),this.resizerElem.appendChild(e);var s={container:r,perspectiveElem:e,startPos:t,endPos:t};return this.threeDElements.push(s),s},HybridRenderer.prototype.build3dContainers=function(){var t,e,r=this.layers.length;for(t=0;r>t;t+=1)this.layers[t].ddd?(e||(e=this.createThreeDContainer(t)),e.endPos=Math.max(e.endPos,t)):e=null},HybridRenderer.prototype.addTo3dContainer=function(t,e){for(var r=0,s=this.threeDElements.length;s>r;){if(e<=this.threeDElements[r].endPos){for(var i,a=this.threeDElements[r].startPos;e>a;)this.elements[a]&&this.elements[a].getBaseElement&&(i=this.elements[a].getBaseElement()),a+=1;i?this.threeDElements[r].container.insertBefore(t,i):this.threeDElements[r].container.appendChild(t);break}r+=1}},HybridRenderer.prototype.configAnimation=function(t){var e=document.createElement("div"),r=this.animationItem.wrapper;e.style.width=t.w+"px",e.style.height=t.h+"px",this.resizerElem=e,styleDiv(e),e.style.transformStyle=e.style.webkitTransformStyle=e.style.mozTransformStyle="flat",this.renderConfig.className&&r.setAttribute("class",this.renderConfig.className),r.appendChild(e),e.style.overflow="hidden";var s=document.createElementNS(svgNS,"svg");s.setAttribute("width","1"),s.setAttribute("height","1"),styleDiv(s),this.resizerElem.appendChild(s);var i=document.createElementNS(svgNS,"defs");s.appendChild(i),this.globalData.defs=i,this.data=t,this.globalData.getAssetData=this.animationItem.getAssetData.bind(this.animationItem),this.globalData.getAssetsPath=this.animationItem.getAssetsPath.bind(this.animationItem),this.globalData.elementLoaded=this.animationItem.elementLoaded.bind(this.animationItem),this.globalData.frameId=0,this.globalData.compSize={w:t.w,h:t.h},this.globalData.frameRate=t.fr,this.layers=t.layers,this.globalData.fontManager=new FontManager,this.globalData.fontManager.addChars(t.chars),this.globalData.fontManager.addFonts(t.fonts,s),this.layerElement=this.resizerElem,this.build3dContainers(),this.updateContainerSize()},HybridRenderer.prototype.destroy=function(){this.animationItem.wrapper.innerHTML="",this.animationItem.container=null,this.globalData.defs=null;var t,e=this.layers?this.layers.length:0;for(t=0;e>t;t++)this.elements[t].destroy();this.elements.length=0,this.destroyed=!0,this.animationItem=null},HybridRenderer.prototype.updateContainerSize=function(){var t,e,r,s,i=this.animationItem.wrapper.offsetWidth,a=this.animationItem.wrapper.offsetHeight,n=i/a,o=this.globalData.compSize.w/this.globalData.compSize.h;o>n?(t=i/this.globalData.compSize.w,e=i/this.globalData.compSize.w,r=0,s=(a-this.globalData.compSize.h*(i/this.globalData.compSize.w))/2):(t=a/this.globalData.compSize.h,e=a/this.globalData.compSize.h,r=(i-this.globalData.compSize.w*(a/this.globalData.compSize.h))/2,s=0),this.resizerElem.style.transform=this.resizerElem.style.webkitTransform="matrix3d("+t+",0,0,0,0,"+e+",0,0,0,0,1,0,"+r+","+s+",0,1)"},HybridRenderer.prototype.renderFrame=SVGRenderer.prototype.renderFrame,HybridRenderer.prototype.hide=function(){this.resizerElem.style.display="none"},HybridRenderer.prototype.show=function(){this.resizerElem.style.display="block"},HybridRenderer.prototype.initItems=function(){if(this.buildAllItems(),this.camera)this.camera.setup();else{var t,e=this.globalData.compSize.w,r=this.globalData.compSize.h,s=this.threeDElements.length;for(t=0;s>t;t+=1)this.threeDElements[t].perspectiveElem.style.perspective=this.threeDElements[t].perspectiveElem.style.webkitPerspective=Math.sqrt(Math.pow(e,2)+Math.pow(r,2))+"px"}},HybridRenderer.prototype.searchExtraCompositions=function(t){var e,r=t.length,s=document.createElement("div");for(e=0;r>e;e+=1)if(t[e].xt){var i=this.createComp(t[e],s,this.globalData.comp,null);i.initExpressions(),this.globalData.projectInterface.registerComposition(i)}},createElement(BaseElement,CVBaseElement),CVBaseElement.prototype.createElements=function(){this.checkParenting()},CVBaseElement.prototype.checkBlendMode=function(t){if(t.blendMode!==this.data.bm){t.blendMode=this.data.bm;var e="";switch(this.data.bm){case 0:e="normal";break;case 1:e="multiply";break;case 2:e="screen";break;case 3:e="overlay";break;case 4:e="darken";break;case 5:e="lighten";break;case 6:e="color-dodge";break;case 7:e="color-burn";break;case 8:e="hard-light";break;case 9:e="soft-light";break;case 10:e="difference";break;case 11:e="exclusion";break;case 12:e="hue";break;case 13:e="saturation";break;case 14:e="color";break;case 15:e="luminosity"}t.canvasContext.globalCompositeOperation=e}},CVBaseElement.prototype.renderFrame=function(t){if(3===this.data.ty)return!1;if(this.checkBlendMode(0===this.data.ty?this.parentGlobalData:this.globalData),!this.isVisible)return this.isVisible;this.finalTransform.opMdf=this.finalTransform.op.mdf,this.finalTransform.matMdf=this.finalTransform.mProp.mdf,this.finalTransform.opacity=this.finalTransform.op.v;var e,r=this.finalTransform.mat;if(this.hierarchy){var s,i=this.hierarchy.length;for(e=this.finalTransform.mProp.v.props,r.cloneFromProps(e),s=0;i>s;s+=1)this.finalTransform.matMdf=this.hierarchy[s].finalTransform.mProp.mdf?!0:this.finalTransform.matMdf,e=this.hierarchy[s].finalTransform.mProp.v.props,r.transform(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],e[11],e[12],e[13],e[14],e[15])}else t?(e=this.finalTransform.mProp.v.props,r.cloneFromProps(e)):r.cloneFromProps(this.finalTransform.mProp.v.props);return t&&(e=t.mat.props,r.transform(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],e[11],e[12],e[13],e[14],e[15]),this.finalTransform.opacity*=t.opacity,this.finalTransform.opMdf=t.opMdf?!0:this.finalTransform.opMdf,this.finalTransform.matMdf=t.matMdf?!0:this.finalTransform.matMdf),this.data.hasMask&&(this.globalData.renderer.save(!0),this.maskManager.renderFrame(0===this.data.ty?null:r)),this.data.hd&&(this.isVisible=!1),this.isVisible},CVBaseElement.prototype.addMasks=function(t){this.maskManager=new CVMaskElement(t,this,this.globalData)},CVBaseElement.prototype.destroy=function(){this.canvasContext=null,this.data=null,this.globalData=null,this.maskManager&&this.maskManager.destroy()},CVBaseElement.prototype.mHelper=new Matrix,createElement(CVBaseElement,CVCompElement),CVCompElement.prototype.ctxTransform=CanvasRenderer.prototype.ctxTransform,CVCompElement.prototype.ctxOpacity=CanvasRenderer.prototype.ctxOpacity,CVCompElement.prototype.save=CanvasRenderer.prototype.save,CVCompElement.prototype.restore=CanvasRenderer.prototype.restore,CVCompElement.prototype.reset=function(){this.contextData.cArrPos=0,this.contextData.cTr.reset(),this.contextData.cO=1},CVCompElement.prototype.resize=function(t){var e=Math.max(t.sx,t.sy);this.canvas.width=this.data.w*e,this.canvas.height=this.data.h*e,this.transformCanvas={sc:e,w:this.data.w*e,h:this.data.h*e,props:[e,0,0,0,0,e,0,0,0,0,1,0,0,0,0,1]};var r,s=this.elements.length;for(r=0;s>r;r+=1)this.elements[r]&&0===this.elements[r].data.ty&&this.elements[r].resize(t)},CVCompElement.prototype.prepareFrame=function(t){if(this.globalData.frameId=this.parentGlobalData.frameId,this.globalData.mdf=!1,this._parent.prepareFrame.call(this,t),this.isVisible!==!1||this.data.xt){var e=t;this.tm&&(e=this.tm.v,e===this.data.op&&(e=this.data.op-1)),this.renderedFrame=e/this.data.sr;var r,s=this.elements.length;for(this.completeLayers||this.checkLayers(t),r=0;s>r;r+=1)(this.completeLayers||this.elements[r])&&(this.elements[r].prepareFrame(e/this.data.sr-this.layers[r].st),0===this.elements[r].data.ty&&this.elements[r].globalData.mdf&&(this.globalData.mdf=!0));this.globalData.mdf&&!this.data.xt&&(this.canvasContext.clearRect(0,0,this.data.w,this.data.h),this.ctxTransform(this.transformCanvas.props))}},CVCompElement.prototype.renderFrame=function(t){if(this._parent.renderFrame.call(this,t)!==!1){if(this.globalData.mdf){var e,r=this.layers.length;for(e=r-1;e>=0;e-=1)(this.completeLayers||this.elements[e])&&this.elements[e].renderFrame()}this.data.hasMask&&this.globalData.renderer.restore(!0),this.firstFrame&&(this.firstFrame=!1),this.parentGlobalData.renderer.save(),this.parentGlobalData.renderer.ctxTransform(this.finalTransform.mat.props),this.parentGlobalData.renderer.ctxOpacity(this.finalTransform.opacity),this.parentGlobalData.renderer.canvasContext.drawImage(this.canvas,0,0,this.data.w,this.data.h),this.parentGlobalData.renderer.restore(),this.globalData.mdf&&this.reset()}},CVCompElement.prototype.setElements=function(t){this.elements=t},CVCompElement.prototype.getElements=function(){return this.elements},CVCompElement.prototype.destroy=function(){var t,e=this.layers.length;for(t=e-1;t>=0;t-=1)this.elements[t].destroy();this.layers=null,this.elements=null,this._parent.destroy.call(this._parent)},CVCompElement.prototype.checkLayers=CanvasRenderer.prototype.checkLayers,CVCompElement.prototype.buildItem=CanvasRenderer.prototype.buildItem,CVCompElement.prototype.checkPendingElements=CanvasRenderer.prototype.checkPendingElements,CVCompElement.prototype.addPendingElement=CanvasRenderer.prototype.addPendingElement,CVCompElement.prototype.buildAllItems=CanvasRenderer.prototype.buildAllItems,CVCompElement.prototype.createItem=CanvasRenderer.prototype.createItem,CVCompElement.prototype.createImage=CanvasRenderer.prototype.createImage,CVCompElement.prototype.createComp=CanvasRenderer.prototype.createComp,CVCompElement.prototype.createSolid=CanvasRenderer.prototype.createSolid,CVCompElement.prototype.createShape=CanvasRenderer.prototype.createShape,CVCompElement.prototype.createText=CanvasRenderer.prototype.createText,CVCompElement.prototype.createBase=CanvasRenderer.prototype.createBase,CVCompElement.prototype.buildElementParenting=CanvasRenderer.prototype.buildElementParenting,createElement(CVBaseElement,CVImageElement),CVImageElement.prototype.createElements=function(){var t=function(){if(this.globalData.elementLoaded(),this.assetData.w!==this.img.width||this.assetData.h!==this.img.height){var t=document.createElement("canvas");t.width=this.assetData.w,t.height=this.assetData.h;var e,r,s=t.getContext("2d"),i=this.img.width,a=this.img.height,n=i/a,o=this.assetData.w/this.assetData.h;n>o?(r=a,e=r*o):(e=i,r=e/o),s.drawImage(this.img,(i-e)/2,(a-r)/2,e,r,0,0,this.assetData.w,this.assetData.h),this.img=t}}.bind(this),e=function(){this.failed=!0,this.globalData.elementLoaded()}.bind(this);this.img=new Image,this.img.addEventListener("load",t,!1),this.img.addEventListener("error",e,!1);var r=this.globalData.getAssetsPath(this.assetData);this.img.src=r,this._parent.createElements.call(this)},CVImageElement.prototype.renderFrame=function(t){if(!this.failed&&this._parent.renderFrame.call(this,t)!==!1){var e=this.canvasContext;this.globalData.renderer.save();var r=this.finalTransform.mat.props;this.globalData.renderer.ctxTransform(r),this.globalData.renderer.ctxOpacity(this.finalTransform.opacity),e.drawImage(this.img,0,0),this.globalData.renderer.restore(this.data.hasMask),this.firstFrame&&(this.firstFrame=!1)}},CVImageElement.prototype.destroy=function(){this.img=null,this._parent.destroy.call(this._parent)},CVMaskElement.prototype.prepareFrame=function(t){var e,r=this.dynamicProperties.length;for(e=0;r>e;e+=1)this.dynamicProperties[e].getValue(t),this.dynamicProperties[e].mdf&&(this.element.globalData.mdf=!0)},CVMaskElement.prototype.renderFrame=function(t){var e,r,s,i,a,n=this.element.canvasContext,o=this.data.masksProperties.length,h=!1;for(e=0;o>e;e++)if("n"!==this.masksProperties[e].mode){h===!1&&(n.beginPath(),h=!0),this.masksProperties[e].inv&&(n.moveTo(0,0),n.lineTo(this.element.globalData.compWidth,0),n.lineTo(this.element.globalData.compWidth,this.element.globalData.compHeight),n.lineTo(0,this.element.globalData.compHeight),n.lineTo(0,0)),a=this.viewData[e].v,r=t?t.applyToPointArray(a.v[0][0],a.v[0][1],0):a.v[0],n.moveTo(r[0],r[1]);var l,p=a._length;for(l=1;p>l;l++)r=t?t.applyToPointArray(a.o[l-1][0],a.o[l-1][1],0):a.o[l-1],s=t?t.applyToPointArray(a.i[l][0],a.i[l][1],0):a.i[l],i=t?t.applyToPointArray(a.v[l][0],a.v[l][1],0):a.v[l],n.bezierCurveTo(r[0],r[1],s[0],s[1],i[0],i[1]);r=t?t.applyToPointArray(a.o[l-1][0],a.o[l-1][1],0):a.o[l-1],s=t?t.applyToPointArray(a.i[0][0],a.i[0][1],0):a.i[0],i=t?t.applyToPointArray(a.v[0][0],a.v[0][1],0):a.v[0],n.bezierCurveTo(r[0],r[1],s[0],s[1],i[0],i[1])}h&&n.clip()},CVMaskElement.prototype.getMaskProperty=MaskElement.prototype.getMaskProperty,CVMaskElement.prototype.destroy=function(){this.element=null},createElement(CVBaseElement,CVShapeElement),CVShapeElement.prototype.transformHelper={opacity:1,mat:new Matrix,matMdf:!1,opMdf:!1},CVShapeElement.prototype.dashResetter=[],CVShapeElement.prototype.createElements=function(){this._parent.createElements.call(this),this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.dynamicProperties,!0)},CVShapeElement.prototype.createStyleElement=function(t,e){var r={data:t,type:t.ty,elements:[]},s={};if(("fl"==t.ty||"st"==t.ty)&&(s.c=PropertyFactory.getProp(this,t.c,1,255,e),s.c.k||(r.co="rgb("+bm_floor(s.c.v[0])+","+bm_floor(s.c.v[1])+","+bm_floor(s.c.v[2])+")")),s.o=PropertyFactory.getProp(this,t.o,0,.01,e),"st"==t.ty){if(r.lc=this.lcEnum[t.lc]||"round",r.lj=this.ljEnum[t.lj]||"round",1==t.lj&&(r.ml=t.ml),s.w=PropertyFactory.getProp(this,t.w,0,null,e),s.w.k||(r.wi=s.w.v),t.d){var i=new DashProperty(this,t.d,"canvas",e);s.d=i,s.d.k||(r.da=s.d.dashArray,r["do"]=s.d.dashoffset[0])}}else r.r=2===t.r?"evenodd":"nonzero";return this.stylesList.push(r),s.style=r,s},CVShapeElement.prototype.createGroupElement=function(t){var e={it:[],prevViewData:[]};return e},CVShapeElement.prototype.createTransformElement=function(t,e){var r={transform:{mat:new Matrix,opacity:1,matMdf:!1,opMdf:!1,op:PropertyFactory.getProp(this,t.o,0,.01,e),mProps:TransformPropertyFactory.getTransformProperty(this,t,e)},elements:[]};return r},CVShapeElement.prototype.createShapeElement=function(t,e){var r={nodes:[],trNodes:[],tr:[0,0,0,0,0,0]},s=4;"rc"==t.ty?s=5:"el"==t.ty?s=6:"sr"==t.ty&&(s=7),r.sh=ShapePropertyFactory.getShapeProp(this,t,s,e),this.shapes.push(r.sh),this.addShapeToModifiers(r),jLen=this.stylesList.length;var i=!1,a=!1;for(j=0;j<jLen;j+=1)this.stylesList[j].closed||(this.stylesList[j].elements.push(r),"st"===this.stylesList[j].type?i=!0:a=!0);return r.st=i,r.fl=a,r},CVShapeElement.prototype.reloadShapes=function(){this.firstFrame=!0;var t,e=this.itemsData.length;for(t=0;e>t;t+=1)this.prevViewData[t]=this.itemsData[t];this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.dynamicProperties,!0);var t,e=this.dynamicProperties.length;for(t=0;e>t;t+=1)this.dynamicProperties[t].getValue();this.renderModifiers()},CVShapeElement.prototype.searchShapes=function(t,e,r,s,i){var a,n,o,h,l=t.length-1,p=[],m=[];for(a=l;a>=0;a-=1){if(h=this.searchProcessedElement(t[a]),h?e[a]=r[h-1]:t[a]._render=i,"fl"==t[a].ty||"st"==t[a].ty)h?e[a].style.closed=!1:e[a]=this.createStyleElement(t[a],s),p.push(e[a].style);else if("gr"==t[a].ty){if(h)for(o=e[a].it.length,n=0;o>n;n+=1)e[a].prevViewData[n]=e[a].it[n];else e[a]=this.createGroupElement(t[a]);this.searchShapes(t[a].it,e[a].it,e[a].prevViewData,s,i)}else if("tr"==t[a].ty)h||(e[a]=this.createTransformElement(t[a],s));else if("sh"==t[a].ty||"rc"==t[a].ty||"el"==t[a].ty||"sr"==t[a].ty)h||(e[a]=this.createShapeElement(t[a],s));else if("tm"==t[a].ty||"rd"==t[a].ty){if(h)f=e[a],f.closed=!1;else{var f=ShapeModifiers.getModifier(t[a].ty);f.init(this,t[a],s),e[a]=f,this.shapeModifiers.push(f)}m.push(f)}else"rp"==t[a].ty&&(h?(f=e[a],f.closed=!0):(f=ShapeModifiers.getModifier(t[a].ty),e[a]=f,f.init(this,t,a,e,s),this.shapeModifiers.push(f),i=!1),m.push(f));this.addProcessedElement(t[a],a+1)}for(l=p.length,a=0;l>a;a+=1)p[a].closed=!0;for(l=m.length,a=0;l>a;a+=1)m[a].closed=!0},CVShapeElement.prototype.addShapeToModifiers=IShapeElement.prototype.addShapeToModifiers,CVShapeElement.prototype.renderModifiers=IShapeElement.prototype.renderModifiers,CVShapeElement.prototype.lcEnum=IShapeElement.prototype.lcEnum,CVShapeElement.prototype.ljEnum=IShapeElement.prototype.ljEnum,CVShapeElement.prototype.searchProcessedElement=IShapeElement.prototype.searchProcessedElement,CVShapeElement.prototype.addProcessedElement=IShapeElement.prototype.addProcessedElement,CVShapeElement.prototype.renderFrame=function(t){this._parent.renderFrame.call(this,t)!==!1&&(this.transformHelper.mat.reset(),this.transformHelper.opacity=this.finalTransform.opacity,this.transformHelper.matMdf=!1,this.transformHelper.opMdf=this.finalTransform.opMdf,this.renderModifiers(),this.renderShape(this.transformHelper,null,null,!0),this.data.hasMask&&this.globalData.renderer.restore(!0))},CVShapeElement.prototype.renderShape=function(t,e,r,s){var i,a;if(!e)for(e=this.shapesData,a=this.stylesList.length,i=0;a>i;i+=1)this.stylesList[i].d="",this.stylesList[i].mdf=!1;r||(r=this.itemsData),a=e.length-1;var n,o;for(n=t,i=a;i>=0;i-=1)if("tr"==e[i].ty){n=r[i].transform;var h=r[i].transform.mProps.v.props;if(n.matMdf=n.mProps.mdf,n.opMdf=n.op.mdf,o=n.mat,o.cloneFromProps(h),t){var l=t.mat.props;n.opacity=t.opacity,n.opacity*=r[i].transform.op.v,n.matMdf=t.matMdf?!0:n.matMdf,n.opMdf=t.opMdf?!0:n.opMdf,o.transform(l[0],l[1],l[2],l[3],l[4],l[5],l[6],l[7],l[8],l[9],l[10],l[11],l[12],l[13],l[14],l[15])}else n.opacity=n.op.o}else"sh"==e[i].ty||"el"==e[i].ty||"rc"==e[i].ty||"sr"==e[i].ty?this.renderPath(e[i],r[i],n):"fl"==e[i].ty?this.renderFill(e[i],r[i],n):"st"==e[i].ty?this.renderStroke(e[i],r[i],n):"gr"==e[i].ty?this.renderShape(n,e[i].it,r[i].it):"tm"==e[i].ty;if(s){a=this.stylesList.length;var p,m,f,c,d,u,y,g=this.globalData.renderer,v=this.globalData.canvasContext;for(g.save(),g.ctxTransform(this.finalTransform.mat.props),i=0;a>i;i+=1)if(y=this.stylesList[i].type,("st"!==y||0!==this.stylesList[i].wi)&&this.stylesList[i].data._render){for(g.save(),d=this.stylesList[i].elements,"st"===y?(v.strokeStyle=this.stylesList[i].co,v.lineWidth=this.stylesList[i].wi,v.lineCap=this.stylesList[i].lc,v.lineJoin=this.stylesList[i].lj,v.miterLimit=this.stylesList[i].ml||0):v.fillStyle=this.stylesList[i].co,g.ctxOpacity(this.stylesList[i].coOp),"st"!==y&&v.beginPath(),m=d.length,p=0;m>p;p+=1){for("st"===y&&(v.beginPath(),this.stylesList[i].da?(v.setLineDash(this.stylesList[i].da),v.lineDashOffset=this.stylesList[i]["do"],this.globalData.isDashed=!0):this.globalData.isDashed&&(v.setLineDash(this.dashResetter),this.globalData.isDashed=!1)),u=d[p].trNodes,c=u.length,f=0;c>f;f+=1)"m"==u[f].t?v.moveTo(u[f].p[0],u[f].p[1]):"c"==u[f].t?v.bezierCurveTo(u[f].p1[0],u[f].p1[1],u[f].p2[0],u[f].p2[1],u[f].p3[0],u[f].p3[1]):v.closePath();"st"===y&&v.stroke()}"st"!==y&&v.fill(this.stylesList[i].r),g.restore()}g.restore(),this.firstFrame&&(this.firstFrame=!1)}},CVShapeElement.prototype.renderPath=function(t,e,r){var s,i,a,n,o=r.matMdf||e.sh.mdf||this.firstFrame;if(o){var h=e.sh.paths,l=r.mat;n=h._length;var p=e.trNodes;for(p.length=0,a=0;n>a;a+=1){var m=h.shapes[a];if(m&&m.v){for(s=m._length,i=1;s>i;i+=1)1==i&&p.push({t:"m",p:l.applyToPointArray(m.v[0][0],m.v[0][1],0)}),p.push({t:"c",p1:l.applyToPointArray(m.o[i-1][0],m.o[i-1][1],0),p2:l.applyToPointArray(m.i[i][0],m.i[i][1],0),p3:l.applyToPointArray(m.v[i][0],m.v[i][1],0)});1==s&&p.push({t:"m",p:l.applyToPointArray(m.v[0][0],m.v[0][1],0)}),m.c&&s&&(p.push({
t:"c",p1:l.applyToPointArray(m.o[i-1][0],m.o[i-1][1],0),p2:l.applyToPointArray(m.i[0][0],m.i[0][1],0),p3:l.applyToPointArray(m.v[0][0],m.v[0][1],0)}),p.push({t:"z"})),e.lStr=p}}if(e.st)for(i=0;16>i;i+=1)e.tr[i]=r.mat.props[i];e.trNodes=p}},CVShapeElement.prototype.renderFill=function(t,e,r){var s=e.style;(e.c.mdf||this.firstFrame)&&(s.co="rgb("+bm_floor(e.c.v[0])+","+bm_floor(e.c.v[1])+","+bm_floor(e.c.v[2])+")"),(e.o.mdf||r.opMdf||this.firstFrame)&&(s.coOp=e.o.v*r.opacity)},CVShapeElement.prototype.renderStroke=function(t,e,r){var s=e.style,i=e.d;i&&(i.mdf||this.firstFrame)&&(s.da=i.dashArray,s["do"]=i.dashoffset[0]),(e.c.mdf||this.firstFrame)&&(s.co="rgb("+bm_floor(e.c.v[0])+","+bm_floor(e.c.v[1])+","+bm_floor(e.c.v[2])+")"),(e.o.mdf||r.opMdf||this.firstFrame)&&(s.coOp=e.o.v*r.opacity),(e.w.mdf||this.firstFrame)&&(s.wi=e.w.v)},CVShapeElement.prototype.destroy=function(){this.shapesData=null,this.globalData=null,this.canvasContext=null,this.stylesList.length=0,this.itemData.length=0,this._parent.destroy.call(this._parent)},createElement(CVBaseElement,CVSolidElement),CVSolidElement.prototype.renderFrame=function(t){if(this._parent.renderFrame.call(this,t)!==!1){var e=this.canvasContext;this.globalData.renderer.save(),this.globalData.renderer.ctxTransform(this.finalTransform.mat.props),this.globalData.renderer.ctxOpacity(this.finalTransform.opacity),e.fillStyle=this.data.sc,e.fillRect(0,0,this.data.sw,this.data.sh),this.globalData.renderer.restore(this.data.hasMask),this.firstFrame&&(this.firstFrame=!1)}},createElement(CVBaseElement,CVTextElement),extendPrototype(ITextElement,CVTextElement),CVTextElement.prototype.tHelper=document.createElement("canvas").getContext("2d"),CVTextElement.prototype.createElements=function(){this._parent.createElements.call(this)},CVTextElement.prototype.buildNewText=function(){var t=this.textProperty.currentData;this.renderedLetters=Array.apply(null,{length:t.l?t.l.length:0});var e=!1;t.fc?(e=!0,this.values.fill=this.buildColor(t.fc)):this.values.fill="rgba(0,0,0,0)",this.fill=e;var r=!1;t.sc&&(r=!0,this.values.stroke=this.buildColor(t.sc),this.values.sWidth=t.sw);var s,i,a=this.globalData.fontManager.getFontByName(t.f),n=t.l,o=this.mHelper;this.stroke=r,this.values.fValue=t.s+"px "+this.globalData.fontManager.getFontByName(t.f).fFamily,i=t.t.length;var h,l,p,m,f,c,d,u,y,g,v=this.data.singleShape,b=t.tr/1e3*t.s,E=0,P=0,x=!0,S=0;for(s=0;i>s;s+=1){for(h=this.globalData.fontManager.getCharData(t.t.charAt(s),a.fStyle,this.globalData.fontManager.getFontByName(t.f).fFamily),l=h&&h.data||{},o.reset(),v&&n[s].n&&(E=-b,P+=t.yOffset,P+=x?1:0,x=!1),f=l.shapes?l.shapes[0].it:[],d=f.length,o.scale(t.s/100,t.s/100),v&&this.applyTextPropertiesToMatrix(t,o,n[s].line,E,P),y=Array.apply(null,{length:d}),c=0;d>c;c+=1){for(m=f[c].ks.k.i.length,u=f[c].ks.k,g=[],p=1;m>p;p+=1)1==p&&g.push(o.applyToX(u.v[0][0],u.v[0][1],0),o.applyToY(u.v[0][0],u.v[0][1],0)),g.push(o.applyToX(u.o[p-1][0],u.o[p-1][1],0),o.applyToY(u.o[p-1][0],u.o[p-1][1],0),o.applyToX(u.i[p][0],u.i[p][1],0),o.applyToY(u.i[p][0],u.i[p][1],0),o.applyToX(u.v[p][0],u.v[p][1],0),o.applyToY(u.v[p][0],u.v[p][1],0));g.push(o.applyToX(u.o[p-1][0],u.o[p-1][1],0),o.applyToY(u.o[p-1][0],u.o[p-1][1],0),o.applyToX(u.i[0][0],u.i[0][1],0),o.applyToY(u.i[0][0],u.i[0][1],0),o.applyToX(u.v[0][0],u.v[0][1],0),o.applyToY(u.v[0][0],u.v[0][1],0)),y[c]=g}v&&(E+=n[s].l,E+=b),this.textSpans[S]?this.textSpans[S].elem=y:this.textSpans[S]={elem:y},S+=1}},CVTextElement.prototype.renderFrame=function(t){if(this._parent.renderFrame.call(this,t)!==!1){var e=this.canvasContext,r=this.finalTransform.mat.props;this.globalData.renderer.save(),this.globalData.renderer.ctxTransform(r),this.globalData.renderer.ctxOpacity(this.finalTransform.opacity),e.font=this.values.fValue,e.lineCap="butt",e.lineJoin="miter",e.miterLimit=4,this.data.singleShape||this.textAnimator.getMeasures(this.textProperty.currentData,this.lettersChangedFlag);var s,i,a,n,o,h,l=this.textAnimator.renderedLetters,p=this.textProperty.currentData.l;i=p.length;var m,f,c,d=null,u=null,y=null;for(s=0;i>s;s+=1)if(!p[s].n){if(m=l[s],m&&(this.globalData.renderer.save(),this.globalData.renderer.ctxTransform(m.p),this.globalData.renderer.ctxOpacity(m.o)),this.fill){for(m&&m.fc?d!==m.fc&&(d=m.fc,e.fillStyle=m.fc):d!==this.values.fill&&(d=this.values.fill,e.fillStyle=this.values.fill),f=this.textSpans[s].elem,n=f.length,this.globalData.canvasContext.beginPath(),a=0;n>a;a+=1)for(c=f[a],h=c.length,this.globalData.canvasContext.moveTo(c[0],c[1]),o=2;h>o;o+=6)this.globalData.canvasContext.bezierCurveTo(c[o],c[o+1],c[o+2],c[o+3],c[o+4],c[o+5]);this.globalData.canvasContext.closePath(),this.globalData.canvasContext.fill()}if(this.stroke){for(m&&m.sw?y!==m.sw&&(y=m.sw,e.lineWidth=m.sw):y!==this.values.sWidth&&(y=this.values.sWidth,e.lineWidth=this.values.sWidth),m&&m.sc?u!==m.sc&&(u=m.sc,e.strokeStyle=m.sc):u!==this.values.stroke&&(u=this.values.stroke,e.strokeStyle=this.values.stroke),f=this.textSpans[s].elem,n=f.length,this.globalData.canvasContext.beginPath(),a=0;n>a;a+=1)for(c=f[a],h=c.length,this.globalData.canvasContext.moveTo(c[0],c[1]),o=2;h>o;o+=6)this.globalData.canvasContext.bezierCurveTo(c[o],c[o+1],c[o+2],c[o+3],c[o+4],c[o+5]);this.globalData.canvasContext.closePath(),this.globalData.canvasContext.stroke()}m&&this.globalData.renderer.restore()}this.globalData.renderer.restore(this.data.hasMask),this.firstFrame&&(this.firstFrame=!1)}},createElement(BaseElement,HBaseElement),HBaseElement.prototype.checkBlendMode=function(){},HBaseElement.prototype.setBlendMode=BaseElement.prototype.setBlendMode,HBaseElement.prototype.getBaseElement=function(){return this.baseElement},HBaseElement.prototype.createElements=function(){this.data.hasMask?(this.layerElement=document.createElementNS(svgNS,"svg"),styleDiv(this.layerElement),this.baseElement=this.layerElement,this.maskedElement=this.layerElement):this.layerElement=this.parentContainer,this.transformedElement=this.layerElement,!this.data.ln||4!==this.data.ty&&0!==this.data.ty||(this.layerElement===this.parentContainer&&(this.layerElement=document.createElementNS(svgNS,"g"),this.baseElement=this.layerElement),this.layerElement.setAttribute("id",this.data.ln)),this.setBlendMode(),this.layerElement!==this.parentContainer&&(this.placeholder=null),this.checkParenting()},HBaseElement.prototype.renderFrame=function(t){if(3===this.data.ty)return!1;if(this.currentFrameNum===this.lastNum||!this.isVisible)return this.isVisible;this.lastNum=this.currentFrameNum,this.finalTransform.opMdf=this.finalTransform.op.mdf,this.finalTransform.matMdf=this.finalTransform.mProp.mdf,this.finalTransform.opacity=this.finalTransform.op.v,this.firstFrame&&(this.finalTransform.opMdf=!0,this.finalTransform.matMdf=!0);var e,r=this.finalTransform.mat;if(this.hierarchy){var s,i=this.hierarchy.length;for(e=this.finalTransform.mProp.v.props,r.cloneFromProps(e),s=0;i>s;s+=1)this.finalTransform.matMdf=this.hierarchy[s].finalTransform.mProp.mdf?!0:this.finalTransform.matMdf,e=this.hierarchy[s].finalTransform.mProp.v.props,r.transform(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],e[11],e[12],e[13],e[14],e[15])}else this.isVisible&&this.finalTransform.matMdf&&(t?(e=this.finalTransform.mProp.v.props,r.cloneFromProps(e)):r.cloneFromProps(this.finalTransform.mProp.v.props));return this.data.hasMask&&this.maskManager.renderFrame(r),t&&(e=t.mat.props,r.cloneFromProps(e),this.finalTransform.opacity*=t.opacity,this.finalTransform.opMdf=t.opMdf?!0:this.finalTransform.opMdf,this.finalTransform.matMdf=t.matMdf?!0:this.finalTransform.matMdf),this.finalTransform.matMdf&&(this.transformedElement.style.transform=this.transformedElement.style.webkitTransform=r.toCSS(),this.finalMat=r),this.finalTransform.opMdf&&(this.transformedElement.style.opacity=this.finalTransform.opacity),this.isVisible},HBaseElement.prototype.destroy=function(){this.layerElement=null,this.transformedElement=null,this.parentContainer=null,this.matteElement&&(this.matteElement=null),this.maskManager&&(this.maskManager.destroy(),this.maskManager=null)},HBaseElement.prototype.getDomElement=function(){return this.layerElement},HBaseElement.prototype.addMasks=function(t){this.maskManager=new MaskElement(t,this,this.globalData)},HBaseElement.prototype.hide=function(){},HBaseElement.prototype.setMatte=function(){},HBaseElement.prototype.buildElementParenting=HybridRenderer.prototype.buildElementParenting,createElement(HBaseElement,HSolidElement),HSolidElement.prototype.createElements=function(){var t=document.createElement("div");styleDiv(t);var e=document.createElementNS(svgNS,"svg");styleDiv(e),e.setAttribute("width",this.data.sw),e.setAttribute("height",this.data.sh),t.appendChild(e),this.layerElement=t,this.transformedElement=t,this.baseElement=t,this.innerElem=t,this.data.ln&&this.innerElem.setAttribute("id",this.data.ln),0!==this.data.bm&&this.setBlendMode();var r=document.createElementNS(svgNS,"rect");r.setAttribute("width",this.data.sw),r.setAttribute("height",this.data.sh),r.setAttribute("fill",this.data.sc),e.appendChild(r),this.data.hasMask&&(this.maskedElement=r),this.checkParenting()},HSolidElement.prototype.hide=SVGBaseElement.prototype.hide,HSolidElement.prototype.show=SVGBaseElement.prototype.show,HSolidElement.prototype.renderFrame=IImageElement.prototype.renderFrame,HSolidElement.prototype.destroy=IImageElement.prototype.destroy,createElement(HBaseElement,HCompElement),HCompElement.prototype.createElements=function(){var t=document.createElement("div");if(styleDiv(t),this.data.ln&&t.setAttribute("id",this.data.ln),t.style.clip="rect(0px, "+this.data.w+"px, "+this.data.h+"px, 0px)",this.data.hasMask){var e=document.createElementNS(svgNS,"svg");styleDiv(e),e.setAttribute("width",this.data.w),e.setAttribute("height",this.data.h);var r=document.createElementNS(svgNS,"g");e.appendChild(r),t.appendChild(e),this.maskedElement=r,this.baseElement=t,this.layerElement=r,this.transformedElement=t}else this.layerElement=t,this.baseElement=this.layerElement,this.transformedElement=t;this.checkParenting()},HCompElement.prototype.hide=ICompElement.prototype.hide,HCompElement.prototype.prepareFrame=ICompElement.prototype.prepareFrame,HCompElement.prototype.setElements=ICompElement.prototype.setElements,HCompElement.prototype.getElements=ICompElement.prototype.getElements,HCompElement.prototype.destroy=ICompElement.prototype.destroy,HCompElement.prototype.renderFrame=function(t){var e,r=this._parent.renderFrame.call(this,t),s=this.layers.length;if(r===!1)return void this.hide();for(this.hidden=!1,e=0;s>e;e+=1)(this.completeLayers||this.elements[e])&&this.elements[e].renderFrame();this.firstFrame&&(this.firstFrame=!1)},HCompElement.prototype.checkLayers=BaseRenderer.prototype.checkLayers,HCompElement.prototype.buildItem=HybridRenderer.prototype.buildItem,HCompElement.prototype.checkPendingElements=HybridRenderer.prototype.checkPendingElements,HCompElement.prototype.addPendingElement=HybridRenderer.prototype.addPendingElement,HCompElement.prototype.buildAllItems=BaseRenderer.prototype.buildAllItems,HCompElement.prototype.createItem=HybridRenderer.prototype.createItem,HCompElement.prototype.buildElementParenting=HybridRenderer.prototype.buildElementParenting,HCompElement.prototype.createImage=HybridRenderer.prototype.createImage,HCompElement.prototype.createComp=HybridRenderer.prototype.createComp,HCompElement.prototype.createSolid=HybridRenderer.prototype.createSolid,HCompElement.prototype.createShape=HybridRenderer.prototype.createShape,HCompElement.prototype.createText=HybridRenderer.prototype.createText,HCompElement.prototype.createBase=HybridRenderer.prototype.createBase,HCompElement.prototype.appendElementInPos=HybridRenderer.prototype.appendElementInPos,createElement(HBaseElement,HShapeElement);var parent=HShapeElement.prototype._parent;extendPrototype(IShapeElement,HShapeElement),HShapeElement.prototype._parent=parent,HShapeElement.prototype._renderShapeFrame=HShapeElement.prototype.renderFrame,HShapeElement.prototype.createElements=function(){var t=document.createElement("div");styleDiv(t);var e=document.createElementNS(svgNS,"svg");styleDiv(e);var r=this.comp.data?this.comp.data:this.globalData.compSize;if(e.setAttribute("width",r.w),e.setAttribute("height",r.h),this.data.hasMask){var s=document.createElementNS(svgNS,"g");t.appendChild(e),e.appendChild(s),this.maskedElement=s,this.layerElement=s,this.shapesContainer=s}else t.appendChild(e),this.layerElement=e,this.shapesContainer=document.createElementNS(svgNS,"g"),this.layerElement.appendChild(this.shapesContainer);this.data.hd||(this.baseElement=t),this.innerElem=t,this.data.ln&&this.innerElem.setAttribute("id",this.data.ln),this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.layerElement,this.dynamicProperties,0,[],!0),this.buildExpressionInterface(),this.layerElement=t,this.transformedElement=t,this.shapeCont=e,0!==this.data.bm&&this.setBlendMode(),this.checkParenting()},HShapeElement.prototype.renderFrame=function(t){var e=this.firstFrame;if(this._renderShapeFrame(),this.isVisible&&(this.elemMdf||e)){var r=this.shapeCont.getBBox(),s=!1;this.currentBBox.w!==r.width&&(this.currentBBox.w=r.width,this.shapeCont.setAttribute("width",r.width),s=!0),this.currentBBox.h!==r.height&&(this.currentBBox.h=r.height,this.shapeCont.setAttribute("height",r.height),s=!0),(s||this.currentBBox.x!==r.x||this.currentBBox.y!==r.y)&&(this.currentBBox.w=r.width,this.currentBBox.h=r.height,this.currentBBox.x=r.x,this.currentBBox.y=r.y,this.shapeCont.setAttribute("viewBox",this.currentBBox.x+" "+this.currentBBox.y+" "+this.currentBBox.w+" "+this.currentBBox.h),this.shapeCont.style.transform=this.shapeCont.style.webkitTransform="translate("+this.currentBBox.x+"px,"+this.currentBBox.y+"px)")}},createElement(HBaseElement,HTextElement),extendPrototype(ITextElement,HTextElement),HTextElement.prototype.createElements=function(){this.isMasked=this.checkMasks();var t=document.createElement("div");if(styleDiv(t),this.layerElement=t,this.transformedElement=t,this.isMasked){this.renderType="svg";var e=document.createElementNS(svgNS,"svg");styleDiv(e),this.cont=e,this.compW=this.comp.data.w,this.compH=this.comp.data.h,e.setAttribute("width",this.compW),e.setAttribute("height",this.compH);var r=document.createElementNS(svgNS,"g");e.appendChild(r),t.appendChild(e),this.maskedElement=r,this.innerElem=r}else this.renderType="html",this.innerElem=t;this.baseElement=t,this.checkParenting()},HTextElement.prototype.buildNewText=function(){var t=this.textProperty.currentData;this.renderedLetters=Array.apply(null,{length:this.textProperty.currentData.l?this.textProperty.currentData.l.length:0});var e=this.innerElem.style;e.color=e.fill=t.fc?this.buildColor(t.fc):"rgba(0,0,0,0)",t.sc&&(e.stroke=this.buildColor(t.sc),e.strokeWidth=t.sw+"px");var r=this.globalData.fontManager.getFontByName(t.f);if(!this.globalData.fontManager.chars)if(e.fontSize=t.s+"px",e.lineHeight=t.s+"px",r.fClass)this.innerElem.className=r.fClass;else{e.fontFamily=r.fFamily;var s=t.fWeight,i=t.fStyle;e.fontStyle=i,e.fontWeight=s}var a,n,o=t.l;n=o.length;var h,l,p,m,f=this.mHelper,c="",d=0;for(a=0;n>a;a+=1){if(this.globalData.fontManager.chars?(this.textPaths[d]?h=this.textPaths[d]:(h=document.createElementNS(svgNS,"path"),h.setAttribute("stroke-linecap","butt"),h.setAttribute("stroke-linejoin","round"),h.setAttribute("stroke-miterlimit","4")),this.isMasked||(this.textSpans[d]?(l=this.textSpans[d],p=l.children[0]):(l=document.createElement("div"),p=document.createElementNS(svgNS,"svg"),p.appendChild(h),styleDiv(l)))):this.isMasked?h=this.textPaths[d]?this.textPaths[d]:document.createElementNS(svgNS,"text"):this.textSpans[d]?(l=this.textSpans[d],h=this.textPaths[d]):(l=document.createElement("span"),styleDiv(l),h=document.createElement("span"),styleDiv(h),l.appendChild(h)),this.globalData.fontManager.chars){var u,y=this.globalData.fontManager.getCharData(t.t.charAt(a),r.fStyle,this.globalData.fontManager.getFontByName(t.f).fFamily);if(u=y?y.data:null,f.reset(),u&&u.shapes&&(m=u.shapes[0].it,f.scale(t.s/100,t.s/100),c=this.createPathShape(f,m),h.setAttribute("d",c)),this.isMasked)this.innerElem.appendChild(h);else if(this.innerElem.appendChild(l),u&&u.shapes){document.body.appendChild(p);var g=p.getBBox();p.setAttribute("width",g.width+2),p.setAttribute("height",g.height+2),p.setAttribute("viewBox",g.x-1+" "+(g.y-1)+" "+(g.width+2)+" "+(g.height+2)),p.style.transform=p.style.webkitTransform="translate("+(g.x-1)+"px,"+(g.y-1)+"px)",o[a].yOffset=g.y-1,l.appendChild(p)}else p.setAttribute("width",1),p.setAttribute("height",1)}else h.textContent=o[a].val,h.setAttributeNS("http://www.w3.org/XML/1998/namespace","xml:space","preserve"),this.isMasked?this.innerElem.appendChild(h):(this.innerElem.appendChild(l),h.style.transform=h.style.webkitTransform="translate3d(0,"+-t.s/1.2+"px,0)");this.textSpans[d]=this.isMasked?h:l,this.textSpans[d].style.display="block",this.textPaths[d]=h,d+=1}for(;d<this.textSpans.length;)this.textSpans[d].style.display="none",d+=1},HTextElement.prototype.hide=SVGTextElement.prototype.hide,HTextElement.prototype.renderFrame=function(t){var e=this._parent.renderFrame.call(this,t);if(e===!1)return void this.hide();if(this.hidden&&(this.hidden=!1,this.innerElem.style.display="block",this.layerElement.style.display="block"),this.data.singleShape){if(!this.firstFrame&&!this.lettersChangedFlag)return;this.isMasked&&this.finalTransform.matMdf&&(this.cont.setAttribute("viewBox",-this.finalTransform.mProp.p.v[0]+" "+-this.finalTransform.mProp.p.v[1]+" "+this.compW+" "+this.compH),this.cont.style.transform=this.cont.style.webkitTransform="translate("+-this.finalTransform.mProp.p.v[0]+"px,"+-this.finalTransform.mProp.p.v[1]+"px)")}if(this.textAnimator.getMeasures(this.textProperty.currentData,this.lettersChangedFlag),this.lettersChangedFlag||this.textAnimator.lettersChangedFlag){var r,s,i=0,a=this.textAnimator.renderedLetters,n=this.textProperty.currentData.l;s=n.length;var o,h,l;for(r=0;s>r;r+=1)n[r].n?i+=1:(h=this.textSpans[r],l=this.textPaths[r],o=a[i],i+=1,this.isMasked?h.setAttribute("transform",o.m):h.style.transform=h.style.webkitTransform=o.m,h.style.opacity=o.o,o.sw&&l.setAttribute("stroke-width",o.sw),o.sc&&l.setAttribute("stroke",o.sc),o.fc&&(l.setAttribute("fill",o.fc),l.style.color=o.fc));if(this.isVisible&&(this.elemMdf||this.firstFrame)&&this.innerElem.getBBox){var p=this.innerElem.getBBox();this.currentBBox.w!==p.width&&(this.currentBBox.w=p.width,this.cont.setAttribute("width",p.width)),this.currentBBox.h!==p.height&&(this.currentBBox.h=p.height,this.cont.setAttribute("height",p.height));var m=1;(this.currentBBox.w!==p.width+2*m||this.currentBBox.h!==p.height+2*m||this.currentBBox.x!==p.x-m||this.currentBBox.y!==p.y-m)&&(this.currentBBox.w=p.width+2*m,this.currentBBox.h=p.height+2*m,this.currentBBox.x=p.x-m,this.currentBBox.y=p.y-m,this.cont.setAttribute("viewBox",this.currentBBox.x+" "+this.currentBBox.y+" "+this.currentBBox.w+" "+this.currentBBox.h),this.cont.style.transform=this.cont.style.webkitTransform="translate("+this.currentBBox.x+"px,"+this.currentBBox.y+"px)")}this.firstFrame&&(this.firstFrame=!1)}},createElement(HBaseElement,HImageElement),HImageElement.prototype.createElements=function(){var t=this.globalData.getAssetsPath(this.assetData),e=new Image;if(this.data.hasMask){var r=document.createElement("div");styleDiv(r);var s=document.createElementNS(svgNS,"svg");styleDiv(s),s.setAttribute("width",this.assetData.w),s.setAttribute("height",this.assetData.h),r.appendChild(s),this.imageElem=document.createElementNS(svgNS,"image"),this.imageElem.setAttribute("width",this.assetData.w+"px"),this.imageElem.setAttribute("height",this.assetData.h+"px"),this.imageElem.setAttributeNS("http://www.w3.org/1999/xlink","href",t),s.appendChild(this.imageElem),this.layerElement=r,this.transformedElement=r,this.baseElement=r,this.innerElem=r,this.maskedElement=this.imageElem}else styleDiv(e),this.layerElement=e,this.baseElement=e,this.innerElem=e,this.transformedElement=e;e.src=t,this.data.ln&&this.innerElem.setAttribute("id",this.data.ln),this.checkParenting()},HImageElement.prototype.show=HSolidElement.prototype.show,HImageElement.prototype.hide=HSolidElement.prototype.hide,HImageElement.prototype.renderFrame=HSolidElement.prototype.renderFrame,HImageElement.prototype.destroy=HSolidElement.prototype.destroy,createElement(HBaseElement,HCameraElement),HCameraElement.prototype.setup=function(){var t,e,r=this.comp.threeDElements.length;for(t=0;r>t;t+=1)e=this.comp.threeDElements[t],e.perspectiveElem.style.perspective=e.perspectiveElem.style.webkitPerspective=this.pe.v+"px",e.container.style.transformOrigin=e.container.style.mozTransformOrigin=e.container.style.webkitTransformOrigin="0px 0px 0px",e.perspectiveElem.style.transform=e.perspectiveElem.style.webkitTransform="matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)"},HCameraElement.prototype.createElements=function(){},HCameraElement.prototype.hide=function(){},HCameraElement.prototype.renderFrame=function(){var t,e,r=this.firstFrame;if(this.hierarchy)for(e=this.hierarchy.length,t=0;e>t;t+=1)r=this.hierarchy[t].finalTransform.mProp.mdf?!0:r;if(r||this.p&&this.p.mdf||this.px&&(this.px.mdf||this.py.mdf||this.pz.mdf)||this.rx.mdf||this.ry.mdf||this.rz.mdf||this.or.mdf||this.a&&this.a.mdf){if(this.mat.reset(),this.p?this.mat.translate(-this.p.v[0],-this.p.v[1],this.p.v[2]):this.mat.translate(-this.px.v,-this.py.v,this.pz.v),this.a){var s=[this.p.v[0]-this.a.v[0],this.p.v[1]-this.a.v[1],this.p.v[2]-this.a.v[2]],i=Math.sqrt(Math.pow(s[0],2)+Math.pow(s[1],2)+Math.pow(s[2],2)),a=[s[0]/i,s[1]/i,s[2]/i],n=Math.sqrt(a[2]*a[2]+a[0]*a[0]),o=Math.atan2(a[1],n),h=Math.atan2(a[0],-a[2]);this.mat.rotateY(h).rotateX(-o)}if(this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v),this.mat.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]),this.mat.translate(this.globalData.compSize.w/2,this.globalData.compSize.h/2,0),this.mat.translate(0,0,this.pe.v),this.hierarchy){var l;for(e=this.hierarchy.length,t=0;e>t;t+=1)l=this.hierarchy[t].finalTransform.mProp.iv.props,this.mat.transform(l[0],l[1],l[2],l[3],l[4],l[5],l[6],l[7],l[8],l[9],l[10],l[11],-l[12],-l[13],l[14],l[15])}e=this.comp.threeDElements.length;var p;for(t=0;e>t;t+=1)p=this.comp.threeDElements[t],p.container.style.transform=p.container.style.webkitTransform=this.mat.toCSS()}this.firstFrame=!1},HCameraElement.prototype.destroy=function(){};var Expressions=function(){function t(t){t.renderer.compInterface=CompExpressionInterface(t.renderer),t.renderer.globalData.projectInterface.registerComposition(t.renderer)}var e={};return e.initExpressions=t,e}();expressionsPlugin=Expressions,function(){function t(){return this.pv}function e(t,e,r){if(!this.k||!this.keyframes)return this.pv;var s=this.comp.renderedFrame,i=this.keyframes,a=i[i.length-1].t;if(a>=s)return this.pv;var n,o;r?(n=e?Math.abs(a-elem.comp.globalData.frameRate*e):Math.max(0,a-this.elem.data.ip),o=a-n):((!e||e>i.length-1)&&(e=i.length-1),o=i[i.length-1-e].t,n=a-o);var h,l,p,m=this.offsetTime||0;if("pingpong"===t.toLowerCase()){var f=Math.floor((s-o)/n);if(f%2!==0)return this.getValueAtTime((n-(s-o)%n+o-m)/this.comp.globalData.frameRate,0)}else{if("offset"===t){var c=this.getValueAtTime(o/this.comp.globalData.frameRate,0),d=this.getValueAtTime(a/this.comp.globalData.frameRate,0),u=this.getValueAtTime(((s-o)%n+o)/this.comp.globalData.frameRate,0),y=Math.floor((s-o)/n);if(this.pv.length){for(p=new Array(c.length),l=p.length,h=0;l>h;h+=1)p[h]=(d[h]-c[h])*y+u[h];return p}return(d-c)*y+u}if("continue"===t){var g=this.getValueAtTime(a/this.comp.globalData.frameRate,0),v=this.getValueAtTime((a-.001)/this.comp.globalData.frameRate,0);if(this.pv.length){for(p=new Array(g.length),l=p.length,h=0;l>h;h+=1)p[h]=g[h]+(g[h]-v[h])*((s-a)/this.comp.globalData.frameRate)/5e-4;return p}return g+(g-v)*((s-a)/.001)}}return this.getValueAtTime(((s-o)%n+o-m)/this.comp.globalData.frameRate,0)}function r(t,e,r){if(!this.k)return this.pv;var s=time*elem.comp.globalData.frameRate,i=this.keyframes,a=i[0].t,n=this.offsetTime||0;if(s>=a)return this.pv;var o,h;r?(o=e?Math.abs(elem.comp.globalData.frameRate*e):Math.max(0,this.elem.data.op-a),h=a+o):((!e||e>i.length-1)&&(e=i.length-1),h=i[e].t,o=h-a);var l,p,m;if("pingpong"===t){var f=Math.floor((a-s)/o);if(f%2===0)return this.getValueAtTime(((a-s)%o+a-n)/this.comp.globalData.frameRate,0)}else{if("offset"===t){var c=this.getValueAtTime(a/this.comp.globalData.frameRate,0),d=this.getValueAtTime(h/this.comp.globalData.frameRate,0),u=this.getValueAtTime((o-(a-s)%o+a)/this.comp.globalData.frameRate,0),y=Math.floor((a-s)/o)+1;if(this.pv.length){for(m=new Array(c.length),p=m.length,l=0;p>l;l+=1)m[l]=u[l]-(d[l]-c[l])*y;return m}return u-(d-c)*y}if("continue"===t){var g=this.getValueAtTime(a/this.comp.globalData.frameRate,0),v=this.getValueAtTime((a+.001)/this.comp.globalData.frameRate,0);if(this.pv.length){for(m=new Array(g.length),p=m.length,l=0;p>l;l+=1)m[l]=g[l]+(g[l]-v[l])*(a-s)/.001;return m}return g+(g-v)*(a-s)/.001}}return this.getValueAtTime((o-(a-s)%o+a-n)/this.comp.globalData.frameRate,0)}function s(t){if(this._cachingAtTime||(this._cachingAtTime={lastValue:-99999,lastIndex:0}),t!==this._cachingAtTime.lastFrame){t*=this.elem.globalData.frameRate,t-=this.offsetTime;var e=this._caching.lastFrame<t?this._caching.lastIndex:0,r=this.interpolateValue(t,e,this.pv,this._cachingAtTime);this._cachingAtTime.lastIndex=r.iterationIndex,this._cachingAtTime.value=r.value,this._cachingAtTime.lastFrame=t}return this._cachingAtTime.value}function i(t){if(void 0!==this.vel)return this.vel;var e,r=-.01,s=this.getValueAtTime(t),i=this.getValueAtTime(t+r);if(s.length){e=Array.apply(null,{length:s.length});var a;for(a=0;a<s.length;a+=1)e[a]=(i[a]-s[a])/r}else e=(i-s)/r;return e}function a(t){this.propertyGroup=t}function n(t,e,r){e.x&&(r.k=!0,r.x=!0,r.getValue&&(r.getPreValue=r.getValue),r.getValue=ExpressionManager.initiateExpression.bind(r)(t,e,r))}function o(t){console.log("time:",t)}function h(t){}function l(t){if(this._shapeValueAtTime||(this._lastIndexAtTime=0,this._lastTimeAtTime=-999999,this._shapeValueAtTime=shape_pool.clone(this.pv)),t!==this._lastTimeAtTime){this._lastTimeAtTime=t,t*=this.elem.globalData.frameRate;var e=this.interpolateShape(t,this._lastIndexAtTime,this._shapeValueAtTime,!1);this._lastIndexAtTime=e.iterationIndex}return this._shapeValueAtTime}var p=function(){function e(t,e){return this.textIndex=t+1,this.textTotal=e,this.getValue(),this.v}return function(r,o){this.pv=1,this.comp=r.comp,this.elem=r,this.mult=.01,this.type="textSelector",this.textTotal=o.totalChars,this.selectorValue=100,this.lastValue=[1,1,1],n.bind(this)(r,o,this),this.getMult=e,this.getVelocityAtTime=i,this.getValueAtTime=this.kf?s.bind(this):t.bind(this),this.setGroupProperty=a}}(),m=TransformPropertyFactory.getTransformProperty;TransformPropertyFactory.getTransformProperty=function(t,e,r){var s=m(t,e,r);return s.getValueAtTime=s.dynamicProperties.length?o.bind(s):h.bind(s),s.setGroupProperty=a,s};var f=PropertyFactory.getProp;PropertyFactory.getProp=function(o,h,l,p,m){var c=f(o,h,l,p,m);c.getValueAtTime=c.kf?s.bind(c):t.bind(c),c.setGroupProperty=a,c.loopOut=e,c.loopIn=r,c.getVelocityAtTime=i,c.numKeys=1===h.a?h.k.length:0;var d=c.k;return void 0!==h.ix&&Object.defineProperty(c,"propertyIndex",{get:function(){return h.ix}}),n(o,h,c),!d&&c.x&&m.push(c),c};var c=ShapePropertyFactory.getConstructorFunction(),d=ShapePropertyFactory.getKeyframedConstructorFunction();c.prototype.vertices=function(t,e){var r=this.v;void 0!==e&&(r=this.getValueAtTime(e,0));var s,i=r._length,a=r[t],n=r.v,o=Array.apply(null,{length:i});for(s=0;i>s;s+=1)o[s]="i"===t||"o"===t?[a[s][0]-n[s][0],a[s][1]-n[s][1]]:[a[s][0],a[s][1]];return o},c.prototype.points=function(t){return this.vertices("v",t)},c.prototype.inTangents=function(t){return this.vertices("i",t)},c.prototype.outTangents=function(t){return this.vertices("o",t)},c.prototype.isClosed=function(){return this.v.c},c.prototype.pointOnPath=function(t,e){var r=this.v;void 0!==e&&(r=this.getValueAtTime(e,0)),this._segmentsLength||(this._segmentsLength=bez.getSegmentsLength(r));for(var s,i=this._segmentsLength,a=i.lengths,n=i.totalLength*t,o=0,h=a.length,l=0;h>o;){if(l+a[o].addedLength>n){s=a[o].segments;var p=o,m=r.c&&o===h-1?0:o+1,f=(n-l)/a[o].addedLength,c=bez.getPointInSegment(r.v[p],r.v[m],r.o[p],r.i[m],f,a[o]);break}l+=a[o].addedLength,o+=1}return c||(c=r.c?[r.v[0][0],r.v[0][1]]:[r.v[r._length-1][0],r.v[r._length-1][1]]),c},c.prototype.vectorOnPath=function(t,e,r){t=1==t?this.v.c?0:.999:t;var s=this.pointOnPath(t,e),i=this.pointOnPath(t+.001,e),a=i[0]-s[0],n=i[1]-s[1],o=Math.sqrt(Math.pow(a,2)+Math.pow(n,2)),h="tangent"===r?[a/o,n/o]:[-n/o,a/o];return h},c.prototype.tangentOnPath=function(t,e){return this.vectorOnPath(t,e,"tangent")},c.prototype.normalOnPath=function(t,e){return this.vectorOnPath(t,e,"normal")},c.prototype.setGroupProperty=a,c.prototype.getValueAtTime=t,d.prototype.vertices=c.prototype.vertices,d.prototype.points=c.prototype.points,d.prototype.inTangents=c.prototype.inTangents,d.prototype.outTangents=c.prototype.outTangents,d.prototype.isClosed=c.prototype.isClosed,d.prototype.pointOnPath=c.prototype.pointOnPath,d.prototype.vectorOnPath=c.prototype.vectorOnPath,d.prototype.tangentOnPath=c.prototype.tangentOnPath,d.prototype.normalOnPath=c.prototype.normalOnPath,d.prototype.setGroupProperty=c.prototype.setGroupProperty,d.prototype.getValueAtTime=l;var u=ShapePropertyFactory.getShapeProp;ShapePropertyFactory.getShapeProp=function(t,e,r,s,i){var a=u(t,e,r,s,i),o=a.k;return void 0!==e.ix&&Object.defineProperty(a,"propertyIndex",{get:function(){return e.ix}}),3===r?n(t,e.pt,a):4===r&&n(t,e.ks,a),!o&&a.x&&s.push(a),a};var y=TextSelectorProp.getTextSelectorProp;TextSelectorProp.getTextSelectorProp=function(t,e,r){return 1===e.t?new p(t,e,r):y(t,e,r)}}(),function(){function t(){return this.data.d.x?(this.comp=this.elem.comp,this.getValue&&(this.getPreValue=this.getValue),this.calculateExpression=ExpressionManager.initiateExpression.bind(this)(this.elem,this.data.d,this),this.getValue=this.getExpressionValue,!0):!1}TextProperty.prototype.searchProperty=function(){return this.kf=this.searchExpressions()||this.data.d.k.length>1,this.kf},TextProperty.prototype.getExpressionValue=function(t){this.calculateExpression(),this.mdf&&(this.currentData.t=this.v.toString(),this.completeTextData(this.currentData))},TextProperty.prototype.searchExpressions=t}();var ExpressionManager=function(){function duplicatePropertyValue(t,e){if(e=e||1,"number"==typeof t||t instanceof Number)return t*e;if(t.i)return JSON.parse(JSON.stringify(t));var r,s=Array.apply(null,{length:t.length}),i=t.length;for(r=0;i>r;r+=1)s[r]=t[r]*e;return s}function shapesEqual(t,e){if(t._length!==e._length||t.c!==e.c)return!1;var r,s=t._length;for(r=0;s>r;r+=1)if(t.v[r][0]!==e.v[r][0]||t.v[r][1]!==e.v[r][1]||t.o[r][0]!==e.o[r][0]||t.o[r][1]!==e.o[r][1]||t.i[r][0]!==e.i[r][0]||t.i[r][1]!==e.i[r][1])return!1;return!0}function $bm_neg(t){var e=typeof t;if("number"===e||"boolean"===e||t instanceof Number)return-t;if(t.constructor===Array){var r,s=t.length,i=[];for(r=0;s>r;r+=1)i[r]=-t[r];return i}}function sum(t,e){var r=typeof t,s=typeof e;if("string"===r||"string"===s)return t+e;if(("number"===r||"boolean"===r||"string"===r||t instanceof Number)&&("number"===s||"boolean"===s||"string"===s||e instanceof Number))return t+e;if(t.constructor===Array&&("number"===s||"boolean"===s||"string"===s||e instanceof Number))return t[0]=t[0]+e,t;if(("number"===r||"boolean"===r||"string"===r||t instanceof Number)&&e.constructor===Array)return e[0]=t+e[0],e;if(t.constructor===Array&&e.constructor===Array){for(var i=0,a=t.length,n=e.length,o=[];a>i||n>i;)o[i]=("number"==typeof t[i]||t[i]instanceof Number)&&("number"==typeof e[i]||e[i]instanceof Number)?t[i]+e[i]:void 0==e[i]?t[i]:t[i]||e[i],i+=1;return o}return 0}function sub(t,e){var r=typeof t,s=typeof e;if(("number"===r||"boolean"===r||"string"===r||t instanceof Number)&&("number"===s||"boolean"===s||"string"===s||e instanceof Number))return"string"===r&&(t=parseInt(t)),
"string"===s&&(e=parseInt(e)),t-e;if(t.constructor===Array&&("number"===s||"boolean"===s||"string"===s||e instanceof Number))return t[0]=t[0]-e,t;if(("number"===r||"boolean"===r||"string"===r||t instanceof Number)&&e.constructor===Array)return e[0]=t-e[0],e;if(t.constructor===Array&&e.constructor===Array){for(var i=0,a=t.length,n=e.length,o=[];a>i||n>i;)o[i]="number"==typeof t[i]||t[i]instanceof Number?t[i]-e[i]:void 0==e[i]?t[i]:t[i]||e[i],i+=1;return o}return 0}function mul(t,e){var r,s=typeof t,i=typeof e;if(("number"===s||"boolean"===s||"string"===s||t instanceof Number)&&("number"===i||"boolean"===i||"string"===i||e instanceof Number))return t*e;var a,n;if(t.constructor===Array&&("number"===i||"boolean"===i||"string"===i||e instanceof Number)){for(n=t.length,r=Array.apply(null,{length:n}),a=0;n>a;a+=1)r[a]=t[a]*e;return r}if(("number"===s||"boolean"===s||"string"===s||t instanceof Number)&&e.constructor===Array){for(n=e.length,r=Array.apply(null,{length:n}),a=0;n>a;a+=1)r[a]=t*e[a];return r}return 0}function div(t,e){var r,s=typeof t,i=typeof e;if(("number"===s||"boolean"===s||"string"===s||t instanceof Number)&&("number"===i||"boolean"===i||"string"===i||e instanceof Number))return t/e;var a,n;if(t.constructor===Array&&("number"===i||"boolean"===i||"string"===i||e instanceof Number)){for(n=t.length,r=Array.apply(null,{length:n}),a=0;n>a;a+=1)r[a]=t[a]/e;return r}if(("number"===s||"boolean"===s||"string"===s||t instanceof Number)&&e.constructor===Array){for(n=e.length,r=Array.apply(null,{length:n}),a=0;n>a;a+=1)r[a]=t/e[a];return r}return 0}function mod(t,e){return"string"==typeof t&&(t=parseInt(t)),"string"==typeof e&&(e=parseInt(e)),t%e}function clamp(t,e,r){if(e>r){var s=r;r=e,e=s}return Math.min(Math.max(t,e),r)}function radiansToDegrees(t){return t/degToRads}function degreesToRadians(t){return t*degToRads}function length(t,e){if("number"==typeof t||t instanceof Number)return e=e||0,Math.abs(t-e);e||(e=helperLengthArray);var r,s=Math.min(t.length,e.length),i=0;for(r=0;s>r;r+=1)i+=Math.pow(e[r]-t[r],2);return Math.sqrt(i)}function normalize(t){return div(t,length(t))}function rgbToHsl(t){var e,r,s=t[0],i=t[1],a=t[2],n=Math.max(s,i,a),o=Math.min(s,i,a),h=(n+o)/2;if(n==o)e=r=0;else{var l=n-o;switch(r=h>.5?l/(2-n-o):l/(n+o),n){case s:e=(i-a)/l+(a>i?6:0);break;case i:e=(a-s)/l+2;break;case a:e=(s-i)/l+4}e/=6}return[e,r,h,t[3]]}function hslToRgb(t){function e(t,e,r){return 0>r&&(r+=1),r>1&&(r-=1),1/6>r?t+6*(e-t)*r:.5>r?e:2/3>r?t+(e-t)*(2/3-r)*6:t}var r,s,i,a=t[0],n=t[1],o=t[2];if(0==n)r=s=i=o;else{var h=.5>o?o*(1+n):o+n-o*n,l=2*o-h;r=e(l,h,a+1/3),s=e(l,h,a),i=e(l,h,a-1/3)}return[r,s,i,t[3]]}function linear(t,e,r,s,i){if(void 0===s||void 0===i)return linear(t,0,1,e,r);if(e>=t)return s;if(t>=r)return i;var a=r===e?0:(t-e)/(r-e);if(!s.length)return s+(i-s)*a;var n,o=s.length,h=Array.apply(null,{length:o});for(n=0;o>n;n+=1)h[n]=s[n]+(i[n]-s[n])*a;return h}function random(t,e){if(void 0===e&&(void 0===t?(t=0,e=1):(e=t,t=void 0)),e.length){var r,s=e.length;t||(t=Array.apply(null,{length:s}));var i=Array.apply(null,{length:s}),a=BMMath.random();for(r=0;s>r;r+=1)i[r]=t[r]+a*(e[r]-t[r]);return i}void 0===t&&(t=0);var n=BMMath.random();return t+n*(e-t)}function createPath(t,e,r,s){e=e&&e.length?e:t,r=r&&r.length?r:t;var a=shape_pool.newShape(),n=t.length;for(a.setPathData(s,n),i=0;i<n;i+=1)a.setTripleAt(t[i][0],t[i][1],r[i][0]+t[i][0],r[i][1]+t[i][1],e[i][0]+t[i][0],e[i][1]+t[i][1],i,!0);return a}function initiateExpression(elem,data,property){function lookAt(t,e){var r=[e[0]-t[0],e[1]-t[1],e[2]-t[2]],s=Math.atan2(r[0],Math.sqrt(r[1]*r[1]+r[2]*r[2]))/degToRads,i=-Math.atan2(r[1],r[2])/degToRads;return[i,s,0]}function easeOut(t,e,r){return-(r-e)*t*(t-2)+e}function nearestKey(t){var e,r,s,i=data.k.length;if(data.k.length&&"number"!=typeof data.k[0])if(r=-1,t*=elem.comp.globalData.frameRate,t<data.k[0].t)r=1,s=data.k[0].t;else{for(e=0;i-1>e;e+=1){if(t===data.k[e].t){r=e+1,s=data.k[e].t;break}if(t>data.k[e].t&&t<data.k[e+1].t){t-data.k[e].t>data.k[e+1].t-t?(r=e+2,s=data.k[e+1].t):(r=e+1,s=data.k[e].t);break}}-1===r&&(r=e+1,s=data.k[e].t)}else r=0,s=0;var a={};return a.index=r,a.time=s/elem.comp.globalData.frameRate,a}function key(t){var e,r,s;if(!data.k.length||"number"==typeof data.k[0])throw new Error("The property has no keyframe at index "+t);t-=1,e={time:data.k[t].t/elem.comp.globalData.frameRate};var i;for(i=t!==data.k.length-1||data.k[t].h?data.k[t].s:data.k[t-1].e,s=i.length,r=0;s>r;r+=1)e[r]=i[r];return e}function framesToTime(t,e){return e||(e=elem.comp.globalData.frameRate),t/e}function timeToFrames(t,e){return t||0===t||(t=time),e||(e=elem.comp.globalData.frameRate),t*e}function seedRandom(t){BMMath.seedrandom(randSeed+t)}function sourceRectAtTime(){return elem.sourceRectAtTime()}function executeExpression(){if(_needsRandom&&seedRandom(randSeed),this.frameExpressionId!==elem.globalData.frameId||"textSelector"===this.type){if(this.lock)return this.v=duplicatePropertyValue(this.pv,this.mult),!0;"textSelector"===this.type&&(textIndex=this.textIndex,textTotal=this.textTotal,selectorValue=this.selectorValue),thisLayer||(thisLayer=elem.layerInterface,thisComp=elem.comp.compInterface,toWorld=thisLayer.toWorld.bind(thisLayer),fromWorld=thisLayer.fromWorld.bind(thisLayer),fromComp=thisLayer.fromComp.bind(thisLayer),mask=thisLayer.mask?thisLayer.mask.bind(thisLayer):null,fromCompToSurface=fromComp),transform||(transform=elem.layerInterface("ADBE Transform Group"),anchorPoint=transform.anchorPoint),4!==elemType||content||(content=thisLayer("ADBE Root Vectors Group")),effect||(effect=thisLayer(4)),hasParent=!(!elem.hierarchy||!elem.hierarchy.length),hasParent&&!parent&&(parent=elem.hierarchy[0].layerInterface),this.lock=!0,this.getPreValue&&this.getPreValue(),value=this.pv,time=this.comp.renderedFrame/this.comp.globalData.frameRate,needsVelocity&&(velocity=velocityAtTime(time)),bindedFn(),this.frameExpressionId=elem.globalData.frameId;var t,e;if(this.mult)if("number"==typeof this.v||this.v instanceof Number||this.v instanceof String||"string"==typeof this.v)this.v*=this.mult;else if(1===this.v.length)this.v=this.v[0]*this.mult;else for(e=this.v.length,value===this.v&&(this.v=2===e?[value[0],value[1]]:[value[0],value[1],value[2]]),t=0;e>t;t+=1)this.v[t]*=this.mult;if(1===this.v.length&&(this.v=this.v[0]),"number"==typeof this.v||this.v instanceof Number||this.v instanceof String||"string"==typeof this.v)this.lastValue!==this.v&&(this.lastValue=this.v,this.mdf=!0);else if(this.v._length)shapesEqual(this.v,this.localShapeCollection.shapes[0])||(this.mdf=!0,this.localShapeCollection.releaseShapes(),this.localShapeCollection.addShape(shape_pool.clone(this.v)));else for(e=this.v.length,t=0;e>t;t+=1)this.v[t]!==this.lastValue[t]&&(this.lastValue[t]=this.v[t],this.mdf=!0);this.lock=!1}}var val=data.x,needsVelocity=/velocity(?![\w\d])/.test(val),_needsRandom=-1!==val.indexOf("random"),elemType=elem.data.ty,transform,content,effect,thisComp=elem.comp,thisProperty=property;elem.comp.frameDuration=1/elem.comp.globalData.frameRate;var inPoint=elem.data.ip/elem.comp.globalData.frameRate,outPoint=elem.data.op/elem.comp.globalData.frameRate,width=elem.data.sw?elem.data.sw:0,height=elem.data.sh?elem.data.sh:0,loopIn,loop_in,loopOut,loop_out,toWorld,fromWorld,fromComp,fromCompToSurface,anchorPoint,thisLayer,thisComp,mask,valueAtTime,velocityAtTime,fn=new Function,fn=eval("[function(){"+val+";if($bm_rt.__shapeObject){this.v=shape_pool.clone($bm_rt.v);}else{this.v=$bm_rt;}}]")[0],bindedFn=fn.bind(this),numKeys=property.kf?data.k.length:0,wiggle=function(t,e){var r,s,i=this.pv.length?this.pv.length:1,a=Array.apply(null,{len:i});for(s=0;i>s;s+=1)a[s]=0;t=5;var n=Math.floor(time*t);for(r=0,s=0;n>r;){for(s=0;i>s;s+=1)a[s]+=-e+2*e*BMMath.random();r+=1}var o=time*t,h=o-Math.floor(o),l=Array.apply({length:i});if(i>1){for(s=0;i>s;s+=1)l[s]=this.pv[s]+a[s]+(-e+2*e*BMMath.random())*h;return l}return this.pv+a[0]+(-e+2*e*BMMath.random())*h}.bind(this);thisProperty.loopIn&&(loopIn=thisProperty.loopIn.bind(thisProperty),loop_in=loopIn),thisProperty.loopOut&&(loopOut=thisProperty.loopOut.bind(thisProperty),loop_out=loopOut);var loopInDuration=function(t,e){return loopIn(t,e,!0)}.bind(this),loopOutDuration=function(t,e){return loopOut(t,e,!0)}.bind(this);this.getValueAtTime&&(valueAtTime=this.getValueAtTime.bind(this)),this.getVelocityAtTime&&(velocityAtTime=this.getVelocityAtTime.bind(this));var comp=elem.comp.globalData.projectInterface.bind(elem.comp.globalData.projectInterface),time,velocity,value,textIndex,textTotal,selectorValue,index=elem.data.ind,hasParent=!(!elem.hierarchy||!elem.hierarchy.length),parent,randSeed=Math.floor(1e6*Math.random());return executeExpression}var ob={},Math=BMMath,window=null,document=null,add=sum,radians_to_degrees=radiansToDegrees,degrees_to_radians=radiansToDegrees,helperLengthArray=[0,0,0,0,0,0];return ob.initiateExpression=initiateExpression,ob}(),ShapeExpressionInterface=function(){function t(t,e,r){return d(t,e,r)}function e(t,e,r){return y(t,e,r)}function r(t,e,r){return g(t,e,r)}function s(t,e,r){return v(t,e,r)}function i(t,e,r){return b(t,e,r)}function a(t,e,r){return E(t,e,r)}function n(t,e,r){return P(t,e,r)}function o(t,e,r){return x(t,e,r)}function h(t,e,r){return S(t,e,r)}function l(t,e,r){return C(t,e,r)}function p(t,e,r){return k(t,e,r)}function m(t,e,r){return A(t,e,r)}function f(t,e,r){var s,i=[],a=t?t.length:0;for(s=0;a>s;s+=1)"gr"==t[s].ty?i.push(ShapeExpressionInterface.createGroupInterface(t[s],e[s],r)):"fl"==t[s].ty?i.push(ShapeExpressionInterface.createFillInterface(t[s],e[s],r)):"st"==t[s].ty?i.push(ShapeExpressionInterface.createStrokeInterface(t[s],e[s],r)):"tm"==t[s].ty?i.push(ShapeExpressionInterface.createTrimInterface(t[s],e[s],r)):"tr"==t[s].ty||("el"==t[s].ty?i.push(ShapeExpressionInterface.createEllipseInterface(t[s],e[s],r)):"sr"==t[s].ty?i.push(ShapeExpressionInterface.createStarInterface(t[s],e[s],r)):"sh"==t[s].ty?i.push(ShapeExpressionInterface.createPathInterface(t[s],e[s],r)):"rc"==t[s].ty?i.push(ShapeExpressionInterface.createRectInterface(t[s],e[s],r)):"rd"==t[s].ty?i.push(ShapeExpressionInterface.createRoundedInterface(t[s],e[s],r)):"rp"==t[s].ty&&i.push(ShapeExpressionInterface.createRepatearInterface(t[s],e[s],r)));return i}var c={createShapeInterface:t,createGroupInterface:e,createTrimInterface:i,createStrokeInterface:s,createTransformInterface:a,createEllipseInterface:n,createStarInterface:o,createRectInterface:h,createRoundedInterface:l,createRepatearInterface:p,createPathInterface:m,createFillInterface:r},d=function(){return function(t,e,r){function s(t){if("number"==typeof t)return i[t-1];for(var e=0,r=i.length;r>e;){if(i[e]._name===t)return i[e];e+=1}}var i;return s.propertyGroup=r,i=f(t,e,s),s}}(),u=function(){return function(t,e,r){var s,i=function(t){for(var e=0,r=s.length;r>e;){if(s[e]._name===t||s[e].mn===t||s[e].propertyIndex===t||s[e].ix===t||s[e].ind===t)return s[e];e+=1}return"number"==typeof t?s[t-1]:void 0};return i.propertyGroup=function(t){return 1===t?i:r(t-1)},s=f(t.it,e.it,i.propertyGroup),i.numProperties=s.length,i.propertyIndex=t.cix,i}}(),y=function(){return function(t,e,r){var s=function(t){switch(t){case"ADBE Vectors Group":case"Contents":case 2:return s.content;case"ADBE Vector Transform Group":case 3:default:return s.transform}};s.propertyGroup=function(t){return 1===t?s:r(t-1)};var i=u(t,e,s.propertyGroup),a=ShapeExpressionInterface.createTransformInterface(t.it[t.it.length-1],e.it[e.it.length-1],s.propertyGroup);return s.content=i,s.transform=a,Object.defineProperty(s,"_name",{get:function(){return t.nm}}),s.numProperties=t.np,s.propertyIndex=t.ix,s.nm=t.nm,s.mn=t.mn,s}}(),g=function(){return function(t,e,r){function s(t){return"Color"===t||"color"===t?s.color:"Opacity"===t||"opacity"===t?s.opacity:void 0}return Object.defineProperty(s,"color",{get:function(){return ExpressionValue(e.c,1/e.c.mult,"color")}}),Object.defineProperty(s,"opacity",{get:function(){return ExpressionValue(e.o,100)}}),Object.defineProperty(s,"_name",{value:t.nm}),Object.defineProperty(s,"mn",{value:t.mn}),e.c.setGroupProperty(r),e.o.setGroupProperty(r),s}}(),v=function(){return function(t,e,r){function s(t){return 1===t?c:r(t-1)}function i(t){return 1===t?l:s(t-1)}function a(r){Object.defineProperty(l,t.d[r].nm,{get:function(){return ExpressionValue(e.d.dataProps[r].p)}})}function n(t){return"Color"===t||"color"===t?n.color:"Opacity"===t||"opacity"===t?n.opacity:"Stroke Width"===t||"stroke width"===t?n.strokeWidth:void 0}var o,h=t.d?t.d.length:0,l={};for(o=0;h>o;o+=1)a(o),e.d.dataProps[o].p.setGroupProperty(i);return Object.defineProperty(n,"color",{get:function(){return ExpressionValue(e.c,1/e.c.mult,"color")}}),Object.defineProperty(n,"opacity",{get:function(){return ExpressionValue(e.o,100)}}),Object.defineProperty(n,"strokeWidth",{get:function(){return ExpressionValue(e.w)}}),Object.defineProperty(n,"dash",{get:function(){return l}}),Object.defineProperty(n,"_name",{value:t.nm}),Object.defineProperty(n,"mn",{value:t.mn}),e.c.setGroupProperty(s),e.o.setGroupProperty(s),e.w.setGroupProperty(s),n}}(),b=function(){return function(t,e,r){function s(t){return 1==t?i:r(--t)}function i(e){return e===t.e.ix||"End"===e||"end"===e?i.end:e===t.s.ix?i.start:e===t.o.ix?i.offset:void 0}return i.propertyIndex=t.ix,e.s.setGroupProperty(s),e.e.setGroupProperty(s),e.o.setGroupProperty(s),i.propertyIndex=t.ix,Object.defineProperty(i,"start",{get:function(){return ExpressionValue(e.s,1/e.s.mult)}}),Object.defineProperty(i,"end",{get:function(){return ExpressionValue(e.e,1/e.e.mult)}}),Object.defineProperty(i,"offset",{get:function(){return ExpressionValue(e.o)}}),Object.defineProperty(i,"_name",{get:function(){return t.nm}}),i.mn=t.mn,i}}(),E=function(){return function(t,e,r){function s(t){return 1==t?i:r(--t)}function i(e){return t.a.ix===e?i.anchorPoint:t.o.ix===e?i.opacity:t.p.ix===e?i.position:t.r.ix===e?i.rotation:t.s.ix===e?i.scale:t.sk&&t.sk.ix===e?i.skew:t.sa&&t.sa.ix===e?i.skewAxis:"Opacity"===e?i.opacity:"Position"===e?i.position:"Anchor Point"===e?i.anchorPoint:"Scale"===e?i.scale:"Rotation"===e||"ADBE Vector Rotation"===e?i.rotation:"Skew"===e?i.skew:"Skew Axis"===e?i.skewAxis:void 0}e.transform.mProps.o.setGroupProperty(s),e.transform.mProps.p.setGroupProperty(s),e.transform.mProps.a.setGroupProperty(s),e.transform.mProps.s.setGroupProperty(s),e.transform.mProps.r.setGroupProperty(s),e.transform.mProps.sk&&(e.transform.mProps.sk.setGroupProperty(s),e.transform.mProps.sa.setGroupProperty(s)),e.transform.op.setGroupProperty(s),Object.defineProperty(i,"opacity",{get:function(){return ExpressionValue(e.transform.mProps.o,1/e.transform.mProps.o.mult)}}),Object.defineProperty(i,"position",{get:function(){return ExpressionValue(e.transform.mProps.p)}}),Object.defineProperty(i,"anchorPoint",{get:function(){return ExpressionValue(e.transform.mProps.a)}});return Object.defineProperty(i,"scale",{get:function(){return ExpressionValue(e.transform.mProps.s,1/e.transform.mProps.s.mult)}}),Object.defineProperty(i,"rotation",{get:function(){return ExpressionValue(e.transform.mProps.r,1/e.transform.mProps.r.mult)}}),Object.defineProperty(i,"skew",{get:function(){return ExpressionValue(e.transform.mProps.sk)}}),Object.defineProperty(i,"skewAxis",{get:function(){return ExpressionValue(e.transform.mProps.sa)}}),Object.defineProperty(i,"_name",{get:function(){return t.nm}}),i.ty="tr",i.mn=t.mn,i}}(),P=function(){return function(t,e,r){function s(t){return 1==t?i:r(--t)}function i(e){return t.p.ix===e?i.position:t.s.ix===e?i.size:void 0}i.propertyIndex=t.ix;var a="tm"===e.sh.ty?e.sh.prop:e.sh;return a.s.setGroupProperty(s),a.p.setGroupProperty(s),Object.defineProperty(i,"size",{get:function(){return ExpressionValue(a.s)}}),Object.defineProperty(i,"position",{get:function(){return ExpressionValue(a.p)}}),Object.defineProperty(i,"_name",{get:function(){return t.nm}}),i.mn=t.mn,i}}(),x=function(){return function(t,e,r){function s(t){return 1==t?i:r(--t)}function i(e){return t.p.ix===e?i.position:t.r.ix===e?i.rotation:t.pt.ix===e?i.points:t.or.ix===e||"ADBE Vector Star Outer Radius"===e?i.outerRadius:t.os.ix===e?i.outerRoundness:!t.ir||t.ir.ix!==e&&"ADBE Vector Star Inner Radius"!==e?t.is&&t.is.ix===e?i.innerRoundness:void 0:i.innerRadius}var a="tm"===e.sh.ty?e.sh.prop:e.sh;return i.propertyIndex=t.ix,a.or.setGroupProperty(s),a.os.setGroupProperty(s),a.pt.setGroupProperty(s),a.p.setGroupProperty(s),a.r.setGroupProperty(s),t.ir&&(a.ir.setGroupProperty(s),a.is.setGroupProperty(s)),Object.defineProperty(i,"position",{get:function(){return ExpressionValue(a.p)}}),Object.defineProperty(i,"rotation",{get:function(){return ExpressionValue(a.r,1/a.r.mult)}}),Object.defineProperty(i,"points",{get:function(){return ExpressionValue(a.pt)}}),Object.defineProperty(i,"outerRadius",{get:function(){return ExpressionValue(a.or)}}),Object.defineProperty(i,"outerRoundness",{get:function(){return ExpressionValue(a.os)}}),Object.defineProperty(i,"innerRadius",{get:function(){return a.ir?ExpressionValue(a.ir):0}}),Object.defineProperty(i,"innerRoundness",{get:function(){return a.is?ExpressionValue(a.is,1/a.is.mult):0}}),Object.defineProperty(i,"_name",{get:function(){return t.nm}}),i.mn=t.mn,i}}(),S=function(){return function(t,e,r){function s(t){return 1==t?i:r(--t)}function i(e){return t.p.ix===e?i.position:t.r.ix===e?i.roundness:t.s.ix===e||"Size"===e?i.size:void 0}var a="tm"===e.sh.ty?e.sh.prop:e.sh;return i.propertyIndex=t.ix,a.p.setGroupProperty(s),a.s.setGroupProperty(s),a.r.setGroupProperty(s),Object.defineProperty(i,"position",{get:function(){return ExpressionValue(a.p)}}),Object.defineProperty(i,"roundness",{get:function(){return ExpressionValue(a.r)}}),Object.defineProperty(i,"size",{get:function(){return ExpressionValue(a.s)}}),Object.defineProperty(i,"_name",{get:function(){return t.nm}}),i.mn=t.mn,i}}(),C=function(){return function(t,e,r){function s(t){return 1==t?i:r(--t)}function i(e){return t.r.ix===e||"Round Corners 1"===e?i.radius:void 0}var a=e;return i.propertyIndex=t.ix,a.rd.setGroupProperty(s),Object.defineProperty(i,"radius",{get:function(){return ExpressionValue(a.rd)}}),Object.defineProperty(i,"_name",{get:function(){return t.nm}}),i.mn=t.mn,i}}(),k=function(){return function(t,e,r){function s(t){return 1==t?i:r(--t)}function i(e){return t.c.ix===e||"Copies"===e?i.copies:t.o.ix===e||"Offset"===e?i.offset:void 0}var a=e;return i.propertyIndex=t.ix,a.c.setGroupProperty(s),a.o.setGroupProperty(s),Object.defineProperty(i,"copies",{get:function(){return ExpressionValue(a.c)}}),Object.defineProperty(i,"offset",{get:function(){return ExpressionValue(a.o)}}),Object.defineProperty(i,"_name",{get:function(){return t.nm}}),i.mn=t.mn,i}}(),A=function(){return function(t,e,r){function s(t){return 1==t?i:r(--t)}function i(t){return"Shape"===t||"shape"===t||"Path"===t||"path"===t||"ADBE Vector Shape"===t||2===t?i.path:void 0}var a=e.sh;return a.setGroupProperty(s),Object.defineProperty(i,"path",{get:function(){return a.k&&a.getValue(),a}}),Object.defineProperty(i,"shape",{get:function(){return a.k&&a.getValue(),a}}),Object.defineProperty(i,"_name",{value:t.nm}),Object.defineProperty(i,"ix",{value:t.ix}),Object.defineProperty(i,"mn",{value:t.mn}),i}}();return c}(),TextExpressionInterface=function(){return function(t){function e(){}var r,s;return Object.defineProperty(e,"sourceText",{get:function(){var e=t.textProperty.currentData.t;return t.textProperty.currentData.t!==r&&(t.textProperty.currentData.t=r,s=new String(e),s.value=e?e:new String(e)),s}}),e}}(),LayerExpressionInterface=function(){function t(t,e){var r=new Matrix;r.reset();var s;if(s=e?this._elem.finalTransform.mProp:this._elem.finalTransform.mProp,s.applyToMatrix(r),this._elem.hierarchy&&this._elem.hierarchy.length){var i,a=this._elem.hierarchy.length;for(i=0;a>i;i+=1)this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(r);return r.applyToPointArray(t[0],t[1],t[2]||0)}return r.applyToPointArray(t[0],t[1],t[2]||0)}function e(t,e){var r=new Matrix;r.reset();var s;if(s=e?this._elem.finalTransform.mProp:this._elem.finalTransform.mProp,s.applyToMatrix(r),this._elem.hierarchy&&this._elem.hierarchy.length){var i,a=this._elem.hierarchy.length;for(i=0;a>i;i+=1)this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(r);return r.inversePoint(t)}return r.inversePoint(t)}function r(t){var e=new Matrix;if(e.reset(),this._elem.finalTransform.mProp.applyToMatrix(e),this._elem.hierarchy&&this._elem.hierarchy.length){var r,s=this._elem.hierarchy.length;for(r=0;s>r;r+=1)this._elem.hierarchy[r].finalTransform.mProp.applyToMatrix(e);return e.inversePoint(t)}return e.inversePoint(t)}return function(s){function i(t){n.mask=new MaskManagerInterface(t,s)}function a(t){n.effect=t}function n(t){switch(t){case"ADBE Root Vectors Group":case"Contents":case 2:return n.shapeInterface;case 1:case 6:case"Transform":case"transform":case"ADBE Transform Group":return o;case 4:case"ADBE Effect Parade":return n.effect}}var o=TransformExpressionInterface(s.transform);return n.toWorld=t,n.fromWorld=e,n.toComp=t,n.fromComp=r,n.sourceRectAtTime=s.sourceRectAtTime.bind(s),n._elem=s,Object.defineProperty(n,"hasParent",{get:function(){return!!s.hierarchy}}),Object.defineProperty(n,"parent",{get:function(){return s.hierarchy[0].layerInterface}}),Object.defineProperty(n,"rotation",{get:function(){return o.rotation}}),Object.defineProperty(n,"scale",{get:function(){return o.scale}}),Object.defineProperty(n,"position",{get:function(){return o.position}}),Object.defineProperty(n,"anchorPoint",{get:function(){return o.anchorPoint}}),Object.defineProperty(n,"transform",{get:function(){return o}}),Object.defineProperty(n,"width",{get:function(){return 0===s.data.ty?s.data.w:100}}),Object.defineProperty(n,"height",{get:function(){return 0===s.data.ty?s.data.h:100}}),Object.defineProperty(n,"source",{get:function(){return s.data.refId}}),Object.defineProperty(n,"index",{get:function(){return s.data.ind}}),Object.defineProperty(n,"_name",{value:s.data.nm}),Object.defineProperty(n,"content",{get:function(){return n.shapeInterface}}),Object.defineProperty(n,"active",{get:function(){return s.isVisible}}),Object.defineProperty(n,"text",{get:function(){return n.textInterface}}),n.registerMaskInterface=i,n.registerEffectsInterface=a,n}}(),CompExpressionInterface=function(){return function(t){function e(e){for(var r=0,s=t.layers.length;s>r;){if(t.layers[r].nm===e||t.layers[r].ind===e)return t.elements[r].layerInterface;r+=1}return{active:!1}}return Object.defineProperty(e,"_name",{value:t.data.nm}),e.layer=e,e.pixelAspect=1,e.height=t.globalData.compSize.h,e.width=t.globalData.compSize.w,e.pixelAspect=1,e.frameDuration=1/t.globalData.frameRate,e}}(),TransformExpressionInterface=function(){return function(t){function e(r){switch(r){case"scale":case"Scale":case"ADBE Scale":case 6:return e.scale;case"rotation":case"Rotation":case"ADBE Rotation":case"ADBE Rotate Z":case 10:return e.rotation;case"position":case"Position":case"ADBE Position":case 2:return t.position;case"anchorPoint":case"AnchorPoint":case"Anchor Point":case"ADBE AnchorPoint":case 1:return e.anchorPoint;case"opacity":case"Opacity":case 11:return e.opacity}}return Object.defineProperty(e,"rotation",{get:function(){return t.rotation}}),Object.defineProperty(e,"scale",{get:function(){return t.scale}}),Object.defineProperty(e,"position",{get:function(){return t.position}}),Object.defineProperty(e,"xPosition",{get:function(){return t.xPosition}}),Object.defineProperty(e,"yPosition",{get:function(){return t.yPosition}}),Object.defineProperty(e,"anchorPoint",{get:function(){return t.anchorPoint}}),Object.defineProperty(e,"opacity",{get:function(){return t.opacity}}),Object.defineProperty(e,"skew",{get:function(){return t.skew}}),Object.defineProperty(e,"skewAxis",{get:function(){return t.skewAxis}}),e}}(),ProjectInterface=function(){function t(t){this.compositions.push(t)}return function(){function e(t){for(var e=0,r=this.compositions.length;r>e;){if(this.compositions[e].data&&this.compositions[e].data.nm===t)return this.compositions[e].prepareFrame&&this.compositions[e].prepareFrame(this.currentFrame),this.compositions[e].compInterface;e+=1}}return e.compositions=[],e.currentFrame=0,e.registerComposition=t,e}}(),EffectsExpressionInterface=function(){function t(t,r){if(t.effects){var s,i=[],a=t.data.ef,n=t.effects.effectElements.length;for(s=0;n>s;s+=1)i.push(e(a[s],t.effects.effectElements[s],r,t));return function(e){for(var r=t.data.ef,s=0,a=r.length;a>s;){if(e===r[s].nm||e===r[s].mn||e===r[s].ix)return i[s];s+=1}}}}function e(t,s,i,a){function n(t){return 1===t?p:i(t-1)}var o,h=[],l=t.ef.length;for(o=0;l>o;o+=1)h.push(5===t.ef[o].ty?e(t.ef[o],s.effectElements[o],s.effectElements[o].propertyGroup,a):r(s.effectElements[o],t.ef[o].ty,a,n));var p=function(e){for(var r=t.ef,s=0,i=r.length;i>s;){if(e===r[s].nm||e===r[s].mn||e===r[s].ix)return 5===r[s].ty?h[s]:h[s]();s+=1}return h[0]()};return p.propertyGroup=n,"ADBE Color Control"===t.mn&&Object.defineProperty(p,"color",{get:function(){return h[0]()}}),Object.defineProperty(p,"numProperties",{get:function(){return t.np}}),p.active=0!==t.en,p}function r(t,e,r,s){function i(){return 10===e?r.comp.compInterface(t.p.v):ExpressionValue(t.p)}return t.p.setGroupProperty&&t.p.setGroupProperty(s),i}var s={createEffectsInterface:t};return s}(),MaskManagerInterface=function(){function t(t,e){this._mask=t,this._data=e}Object.defineProperty(t.prototype,"maskPath",{get:function(){return this._mask.prop.k&&this._mask.prop.getValue(),this._mask.prop}});var e=function(e,r){var s,i=Array.apply(null,{length:e.viewData.length}),a=e.viewData.length;for(s=0;a>s;s+=1)i[s]=new t(e.viewData[s],e.masksProperties[s]);var n=function(t){for(s=0;a>s;){if(e.masksProperties[s].nm===t)return i[s];s+=1}};return n};return e}(),ExpressionValue=function(){return function(t,e,r){var s;t.k&&t.getValue();var i,a,n;if(r){if("color"===r){for(a=4,s=Array.apply(null,{length:a}),n=Array.apply(null,{length:a}),i=0;a>i;i+=1)s[i]=n[i]=e&&3>i?t.v[i]*e:1;s.value=n}}else if("number"==typeof t.v||t.v instanceof Number)s=new Number(e?t.v*e:t.v),s.value=e?t.v*e:t.v;else{for(a=t.v.length,s=Array.apply(null,{length:a}),n=Array.apply(null,{length:a}),i=0;a>i;i+=1)s[i]=n[i]=e?t.v[i]*e:t.v[i];s.value=n}return s.numKeys=t.keyframes?t.keyframes.length:0,s.key=function(e){return s.numKeys?t.keyframes[e-1].t:0},s.valueAtTime=t.getValueAtTime,s.propertyGroup=t.propertyGroup,s}}();GroupEffect.prototype.getValue=function(){this.mdf=!1;var t,e=this.dynamicProperties.length;for(t=0;e>t;t+=1)this.dynamicProperties[t].getValue(),this.mdf=this.dynamicProperties[t].mdf?!0:this.mdf},GroupEffect.prototype.init=function(t,e,r){this.data=t,this.mdf=!1,this.effectElements=[];var s,i,a=this.data.ef.length,n=this.data.ef;for(s=0;a>s;s+=1)switch(n[s].ty){case 0:i=new SliderEffect(n[s],e,r),this.effectElements.push(i);break;case 1:i=new AngleEffect(n[s],e,r),this.effectElements.push(i);break;case 2:i=new ColorEffect(n[s],e,r),this.effectElements.push(i);break;case 3:i=new PointEffect(n[s],e,r),this.effectElements.push(i);break;case 4:case 7:i=new CheckboxEffect(n[s],e,r),this.effectElements.push(i);break;case 10:i=new LayerIndexEffect(n[s],e,r),this.effectElements.push(i);break;case 11:i=new MaskIndexEffect(n[s],e,r),this.effectElements.push(i);break;case 5:i=new EffectsManager(n[s],e,r),this.effectElements.push(i);break;case 6:i=new NoValueEffect(n[s],e,r),this.effectElements.push(i)}};var lottiejs={};lottiejs.play=play,lottiejs.pause=pause,lottiejs.setLocationHref=setLocationHref,lottiejs.togglePause=togglePause,lottiejs.setSpeed=setSpeed,lottiejs.setDirection=setDirection,lottiejs.stop=stop,lottiejs.moveFrame=moveFrame,lottiejs.searchAnimations=searchAnimations,lottiejs.registerAnimation=registerAnimation,lottiejs.loadAnimation=loadAnimation,lottiejs.setSubframeRendering=setSubframeRendering,lottiejs.resize=resize,lottiejs.start=start,lottiejs.goToAndStop=goToAndStop,lottiejs.destroy=destroy,lottiejs.setQuality=setQuality,lottiejs.inBrowser=inBrowser,lottiejs.installPlugin=installPlugin,lottiejs.__getFactory=getFactory,lottiejs.version="5.0.0";var standalone="__[STANDALONE]__",animationData="__[ANIMATIONDATA]__",renderer="";if(standalone){var scripts=document.getElementsByTagName("script"),index=scripts.length-1,myScript=scripts[index]||{src:""},queryString=myScript.src.replace(/^[^\?]+\??/,"");renderer=getQueryVariable("renderer")}var readyStateCheckInterval=setInterval(checkReady,100);return lottiejs});

!function(t){var i=t(window);t.fn.visible=function(t,e,o){if(!(this.length<1)){var r=this.length>1?this.eq(0):this,n=r.get(0),f=i.width(),h=i.height(),o=o?o:"both",l=e===!0?n.offsetWidth*n.offsetHeight:!0;if("function"==typeof n.getBoundingClientRect){var g=n.getBoundingClientRect(),u=g.top>=0&&g.top<h,s=g.bottom>0&&g.bottom<=h,c=g.left>=0&&g.left<f,a=g.right>0&&g.right<=f,v=t?u||s:u&&s,b=t?c||a:c&&a;if("both"===o)return l&&v&&b;if("vertical"===o)return l&&v;if("horizontal"===o)return l&&b}else{var d=i.scrollTop(),p=d+h,w=i.scrollLeft(),m=w+f,y=r.offset(),z=y.top,B=z+r.height(),C=y.left,R=C+r.width(),j=t===!0?B:z,q=t===!0?z:B,H=t===!0?R:C,L=t===!0?C:R;if("both"===o)return!!l&&p>=q&&j>=d&&m>=L&&H>=w;if("vertical"===o)return!!l&&p>=q&&j>=d;if("horizontal"===o)return!!l&&m>=L&&H>=w}}}}(jQuery);

jQuery('.accordion:not([data-state="open"]):not(.accordion--sm-only) .accordion__content').hide()


if ( jQuery(window).width() < 768 ) {
  jQuery('.accordion:not([data-state="open"]) .accordion__content').hide()
}

jQuery(document).on('change', '.accordion input', function() {
  var name = jQuery(this).attr('name');
  var thisInput = this;
  var otherContent = jQuery('input[name="' + name +'"]').not(thisInput).parents('.accordion').find('.accordion__content');

  var thisContent = jQuery(this).parents('.accordion').find('.accordion__content');

  if(jQuery(this).is(':checked')) {
    otherContent.slideUp(300);
    thisContent.slideDown(300);
  } else {
    otherContent.slideDown(300);
    thisContent.slideUp(300);
  }
})

/**
 * jquery.baraja.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2012, Codrops
 * http://www.codrops.com
 */

jQuery.fn.reverse = [].reverse;

;( function( $, window, undefined ) {

	

	// global

	$.Baraja = function( options, element ) {

		this.$el = $( element );
		this._init( options );

	};

	// the options
	$.Baraja.defaults = {
		// if we want to specify a selector that triggers the next() function. example: '#baraja-nav-next'
		nextEl : '',
		// if we want to specify a selector that triggers the previous() function
		prevEl : '',
		// default transition speed
		speed : 300,
		// default transition easing
		easing : 'ease-in-out'
	};

	$.Baraja.prototype = {

		_init : function( options ) {

			// options
			this.options = $.extend( true, {}, $.Baraja.defaults, options );

			var transEndEventNames = {
				'WebkitTransition' : 'webkitTransitionEnd',
				'MozTransition' : 'transitionend',
				'OTransition' : 'oTransitionEnd',
				'msTransition' : 'MSTransitionEnd',
				'transition' : 'transitionend'
			};
			this.transEndEventName = 'transitionend'

			this._setDefaultFanSettings();

			this.$items = this.$el.children( 'li' );
			this.itemsCount = this.$items.length;
			if( this.itemsCount === 0 ) {
				return false;
			}
			// support for CSS Transitions
			this.supportTransitions = true;
			// opened/closed deck
			this.closed = true;
			// lowest value for the z-index given to the items
			this.itemZIndexMin = 1000;
			// sets the item's z-index value
			this._setStack();
			// initialize some events
			this._initEvents();

		},
		_setDefaultFanSettings : function() {

			this.fanSettings = {
				// speed for opening/closing
				speed : 500,
				// easing for opening/closing
				easing : 'ease-out',
				// difference/range of possible angles that the items will have
				// example: with range:90 and center:false the first item
				// will have 0deg and the last one 90deg;
				// if center:true, then the first one will have 45deg
				// and the last one -45deg; in both cases the difference is 90deg
				range : 90,
				// this defines the position of the first item
				// (to the right, to the left)
				// and its angle (clockwise / counterclockwise)
				direction : 'right',
				// transform origin:
				// you can also pass a minX and maxX, meaning the left value
				// will vary between minX and maxX
				origin : { x : 25, y : 100 },
				// additional translation of each item
				translation : 0,
				// if the cards should be centered after the transform
				// is applied
				center : true,
				// add a random factor to the final transform
				scatter : false
			};

		},
		_validateDefaultFanSettings : function( settings ) {

			if( !settings.origin ) {
				settings.origin = this.fanSettings.origin;
			}
			else {
				settings.origin.x = settings.origin.x || this.fanSettings.origin.x;
				settings.origin.y = settings.origin.y || this.fanSettings.origin.y;
			}
			settings.speed = settings.speed || this.fanSettings.speed;
			settings.easing = settings.easing || this.fanSettings.easing;
			settings.direction = settings.direction || this.fanSettings.direction;
			settings.range = settings.range || this.fanSettings.range;
			settings.translation = settings.translation || this.fanSettings.translation;
			if( settings.center == undefined ) {
				settings.center = this.fanSettings.center
			}
			if( settings.scatter == undefined ) {
				settings.scatter = this.fanSettings.scatter
			}

			this.direction = settings.direction;

			return settings;

		},
		_setStack : function( $items ) {

			var self = this;
			$items = $items || this.$items;

			$items.each( function( i ) {

				$( this ).css( 'z-index', self.itemZIndexMin + self.itemsCount - 1 - i );

			} );

		},
		_updateStack : function( $el, dir ) {

			var currZIndex = Number( $el.css( 'z-index' ) ),
				newZIndex = dir === 'next' ? this.itemZIndexMin - 1 : this.itemZIndexMin + this.itemsCount,
				extra = dir === 'next' ? '+=1' : '-=1';

			$el.css( 'z-index', newZIndex );

			this.$items.filter( function() {

				var zIdx = Number( $( this ).css( 'z-index' ) ),
					cond = dir === 'next' ? zIdx < currZIndex : zIdx > currZIndex

				return cond;

			} ).css( 'z-index', extra );

		},
		_initEvents : function() {

			var self = this;
			if( this.options.nextEl !== '' ) {
				this.options.nextEl.on( 'click.baraja', function() {
					self._navigate( 'next' );
					return false;

				} );

			}

			if( this.options.prevEl !== '' ) {

				this.options.prevEl.on( 'click.baraja', function() {

					self._navigate( 'prev' );
					return false;

				} );

			}

			this.$el.on( 'click.baraja', 'li', function() {

				if( !self.isAnimating ) {

					self._move2front( $( this ) );

				}

			} );

		},
		_resetTransition : function( $el ) {

			$el.css( {
				'-webkit-transition' : 'none',
				'-moz-transition' : 'none',
				'-ms-transition' : 'none',
				'-o-transition' : 'none',
				'transition' : 'none'
			} );

		},
		_setOrigin : function( $el, x, y ) {

			$el.css( 'transform-origin' , x + '% ' + y + '%' );

		},
		_setTransition : function( $el, prop, speed, easing, delay ) {

			if( !this.supportTransitions ) {
				return false;
			}
			if( !prop ) {
				prop = 'all';
			}
			if( !speed ) {
				speed = this.options.speed;
			}
			if( !easing ) {
				easing = this.options.easing;
			}
			if( !delay ) {
				delay = 0;
			}

			var styleCSS = '';

			prop === 'transform' ?
				styleCSS = {
					'-webkit-transition' : '-webkit-transform ' + speed + 'ms ' + easing + ' ' + delay + 'ms',
					'-moz-transition' : '-moz-transform ' + speed + 'ms ' + easing + ' ' + delay + 'ms',
					'-ms-transition' : '-ms-transform ' + speed + 'ms ' + easing + ' ' + delay + 'ms',
					'-o-transition' : '-o-transform ' + speed + 'ms ' + easing + ' ' + delay + 'ms',
					'transition' : 'transform ' + speed + 'ms ' + easing + ' ' + delay + 'ms'
				} :
				styleCSS = {
					'-webkit-transition' : prop + ' ' + speed + 'ms ' + easing + ' ' + delay + 'ms',
					'-moz-transition' : prop + ' ' + speed + 'ms ' + easing + ' ' + delay + 'ms',
					'-ms-transition' : prop + ' ' + speed + 'ms ' + easing + ' ' + delay + 'ms',
					'-o-transition' : prop + ' ' + speed + 'ms ' + easing + ' ' + delay + 'ms',
					'transition' : prop + ' ' + speed + 'ms ' + easing + ' ' + delay + 'ms'
				}

			$el.css( styleCSS );

		},
		_applyTransition : function( $el, styleCSS, fncomplete, force ) {

			if( this.supportTransitions ) {

				if( fncomplete ) {

					$el.on( this.transEndEventName, fncomplete );

					if( force ) {
						fncomplete.call();
					}

				}

				setTimeout( function() { $el.css( styleCSS ); }, 25 );

			}
			else {

				$el.css( styleCSS );

				if( fncomplete ) {

					fncomplete.call();

				}

			}

		},
		_navigate : function( dir ) {

			this.closed = false;

			var self = this,
				extra = 15,
				cond = dir === 'next' ? self.itemZIndexMin + self.itemsCount - 1 : self.itemZIndexMin,
				$item = this.$items.filter( function() {

					return Number( $( this ).css( 'z-index' ) ) === cond;

				} ),
				translation = dir === 'next' ? $item.outerWidth( true ) + extra : $item.outerWidth( true ) * -1 - extra,
				rotation = dir === 'next' ? 5 : 5 * -1;

			this._setTransition( $item, 'transform', this.options.speed, this.options.easing );

			this._applyTransition( $item, { transform : 'translate(' + translation + 'px) rotate(' + rotation + 'deg)' }, function() {

				$item.off( self.transEndEventName );
				self._updateStack( $item, dir );

				self._applyTransition( $item, { transform : 'translate(0px) rotate(0deg)' }, function() {

					$item.off( self.transEndEventName );
					self.isAnimating = false;
					$item.removeClass('shown')
					if($item.next().length > 0) {
						$item.next().addClass('shown')
					} else {
						$item.parent('ul').find('li:first').addClass('shown')
					}

					self.closed = true;

				} );

			} );

		},
		_move2front : function( $item ) {

			this.isAnimating = true;

			var self = this,
				isTop = Number( $item.css( 'z-index' ) ) === this.itemZIndexMin + this.itemsCount - 1,
				callback = isTop ? function() { self.isAnimating = false; } : function() { return false; },
				$item = isTop ? null : $item;

			// if it's the one with higher z-index, just close the baraja
			if( !this.closed ) {

				this._close( callback, $item );

			}
			else {

				//this._fan();

			}

			if( isTop ) {
				return false;
			}

			this._resetTransition( $item );
			this._setOrigin( $item, 50, 50 );

			$item.css( {
				opacity : 0,
				transform : 'scale(2) translate(100px) rotate(20deg)'
			} );

			this._updateStack( $item, 'prev' );

			setTimeout( function() {

				self._setTransition( $item, 'all', self.options.speed, 'ease-in' );
				self._applyTransition( $item, { transform : 'none', opacity : 1 }, function() {

					$item.off( self.transEndEventName );
					self.isAnimating = false;

				} );

			}, this.options.speed / 2 );

		},
		_close : function( callback, $item ) {

			var self = this,
				$items = self.$items,
				force = this.closed ? true : false;

			if( $item ) {
				$items = $items.not( $item );
			}

			this._applyTransition( $items, { transform : 'none' }, function() {

				self.closed = true;
				$items.off( self.transEndEventName );
				self._resetTransition( $items );
				setTimeout(function() {

					self._setOrigin( $items, 50, 50 );

					if( callback ) {
						callback.call();
					}

				}, 25);

			}, force );

		},
		_fan : function( settings ) {

			var self = this;

			this.closed = false;

			settings = this._validateDefaultFanSettings( settings || {} );

			// set transform origins
			// if minX and maxX are passed:
			if( settings.origin.minX && settings.origin.maxX ) {

				var max = settings.origin.maxX, min = settings.origin.minX,
					stepOrigin = ( max - min ) / this.itemsCount;

				this.$items.each( function( i ) {

					var $el = $( this ),
						pos = self.itemsCount - 1 - ( Number( $el.css( 'z-index' ) ) - self.itemZIndexMin ),
						originX = pos * ( max - min + stepOrigin ) / self.itemsCount + min;

					if( settings.direction === 'left' ) {

						originX = max + min - originX;

					}

					self._setOrigin( $( this ), originX, settings.origin.y );

				} );

			}
			else {

				this._setOrigin( this.$items, settings.origin.x , settings.origin.y );

			}

			this._setTransition( this.$items, 'transform', settings.speed, settings.easing );

			var stepAngle = settings.range / ( this.itemsCount - 1 ),
				stepTranslation = settings.translation / ( this.itemsCount - 1 ),
				cnt = 0;

			this.$items.each( function( i ) {

				var $el = $( this ),
					pos = self.itemsCount - 1 - ( Number( $el.css( 'z-index' ) ) - self.itemZIndexMin ),
					val = settings.center ? settings.range / 2 : settings.range,
					angle = val - stepAngle * pos,
					position = stepTranslation * ( self.itemsCount - pos - 1 );

				if( settings.direction === 'left' ) {

					angle *= -1;
					position *= -1;

				}

				if( settings.scatter ) {

					var extraAngle = Math.floor( Math.random() * stepAngle ),
						extraPosition = Math.floor( Math.random() * stepTranslation ) ;

					// not for the first item..
					if( pos !== self.itemsCount - 1 ) {

						angle = settings.direction === 'left' ? angle + extraAngle : angle - extraAngle;
						position = settings.direction === 'left' ? position - extraPosition : position + extraPosition;

					}

				}

				// save..
				$el.data( { translation : position, rotation : angle } );

				self._applyTransition( $el, { transform : 'translate(' + position + 'px) rotate(' + angle + 'deg)' }, function() {

					++cnt;
					$el.off( self.transEndEventName );

					if( cnt === self.itemsCount - 1 ) {
						self.isAnimating = false;
					}

				} );

			} );

		},
		// adds new elements to the deck
		_add : function( $elems ) {

			var self = this,
				newElemsCount = $elems.length, cnt = 0;

			$elems.css( 'opacity', 0 ).appendTo( this.$el );

			// reset
			this.$items = this.$el.children( 'li' );
			this.itemsCount = this.$items.length;

			// set z-indexes
			this._setStack( $elems );

			// animate new items
			$elems.css( 'transform', 'scale(1.8) translate(200px) rotate(15deg)' ).reverse().each( function( i ) {

				var $el = $( this );

				self._setTransition( $el, 'all', 500, 'ease-out', i * 200 );
				self._applyTransition( $el, { transform : 'none', opacity : 1 }, function() {

					++cnt;

					$el.off( self.transEndEventName );
					self._resetTransition( $el );

					if( cnt === newElemsCount ) {
						self.isAnimating = false;
					}

				} );

			} );

		},
		_allowAction : function() {

			return this.itemsCount > 1;

		},
		_prepare : function( callback ) {

			var self = this;

			if( !this.closed ) {

				this._close( function() {

					callback.call();

				} );

			}
			else {

				callback.call();

			}

		},
		_dispatch : function( action, args ) {

			var self = this;

			if( ( ( action === this._fan || action === this._navigate ) && !this._allowAction() ) || this.isAnimating ) {
				return false;
			}

			this.isAnimating = true;

			this._prepare( function() {

				action.call( self, args );

			} );

		},
		// public method: closes the deck
		close : function( settings ) {

			if( this.isAnimating ) {
				return false;
			}
			this._close();

		},
		// public method: shows next item
		next : function() {

			this._dispatch( this._navigate, 'next' );

		},
		// public method: shows previous item
		previous : function() {

			this._dispatch( this._navigate, 'prev' );

		},
		// public method: opens the deck
		fan : function( settings ) {

			this._dispatch( this._fan, settings );

		},
		// public method: adds new elements
		add : function ( $elems ) {

			this._dispatch( this._add, $elems );

		}

	};

	var logError = function( message ) {

		if ( window.console ) {

			window.console.error( message );

		}

	};

	$.fn.baraja = function( options ) {

		var instance = $.data( this, 'baraja' );

		if ( typeof options === 'string' ) {

			var args = Array.prototype.slice.call( arguments, 1 );

			this.each(function() {

				if ( !instance ) {

					logError( "cannot call methods on baraja prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;

				}

				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {

					logError( "no such method '" + options + "' for baraja instance" );
					return;

				}

				instance[ options ].apply( instance, args );

			});

		}
		else {

			this.each(function() {

				if ( instance ) {

					instance._init();

				}
				else {

					instance = $.data( this, 'baraja', new $.Baraja( options, this ) );

				}

			});

		}

		return instance;

	};

} )( jQuery, window );

/*! Select2 4.0.4 | https://github.com/select2/select2/blob/master/LICENSE.md */!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof module&&module.exports?module.exports=function(b,c){return void 0===c&&(c="undefined"!=typeof window?require("jquery"):require("jquery")(b)),a(c),c}:a(jQuery)}(function(a){var b=function(){if(a&&a.fn&&a.fn.select2&&a.fn.select2.amd)var b=a.fn.select2.amd;var b;return function(){if(!b||!b.requirejs){b?c=b:b={};var a,c,d;!function(b){function e(a,b){return v.call(a,b)}function f(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o=b&&b.split("/"),p=t.map,q=p&&p["*"]||{};if(a){for(a=a.split("/"),g=a.length-1,t.nodeIdCompat&&x.test(a[g])&&(a[g]=a[g].replace(x,"")),"."===a[0].charAt(0)&&o&&(n=o.slice(0,o.length-1),a=n.concat(a)),k=0;k<a.length;k++)if("."===(m=a[k]))a.splice(k,1),k-=1;else if(".."===m){if(0===k||1===k&&".."===a[2]||".."===a[k-1])continue;k>0&&(a.splice(k-1,2),k-=2)}a=a.join("/")}if((o||q)&&p){for(c=a.split("/"),k=c.length;k>0;k-=1){if(d=c.slice(0,k).join("/"),o)for(l=o.length;l>0;l-=1)if((e=p[o.slice(0,l).join("/")])&&(e=e[d])){f=e,h=k;break}if(f)break;!i&&q&&q[d]&&(i=q[d],j=k)}!f&&i&&(f=i,h=j),f&&(c.splice(0,h,f),a=c.join("/"))}return a}function g(a,c){return function(){var d=w.call(arguments,0);return"string"!=typeof d[0]&&1===d.length&&d.push(null),o.apply(b,d.concat([a,c]))}}function h(a){return function(b){return f(b,a)}}function i(a){return function(b){r[a]=b}}function j(a){if(e(s,a)){var c=s[a];delete s[a],u[a]=!0,n.apply(b,c)}if(!e(r,a)&&!e(u,a))throw new Error("No "+a);return r[a]}function k(a){var b,c=a?a.indexOf("!"):-1;return c>-1&&(b=a.substring(0,c),a=a.substring(c+1,a.length)),[b,a]}function l(a){return a?k(a):[]}function m(a){return function(){return t&&t.config&&t.config[a]||{}}}var n,o,p,q,r={},s={},t={},u={},v=Object.prototype.hasOwnProperty,w=[].slice,x=/\.js$/;p=function(a,b){var c,d=k(a),e=d[0],g=b[1];return a=d[1],e&&(e=f(e,g),c=j(e)),e?a=c&&c.normalize?c.normalize(a,h(g)):f(a,g):(a=f(a,g),d=k(a),e=d[0],a=d[1],e&&(c=j(e))),{f:e?e+"!"+a:a,n:a,pr:e,p:c}},q={require:function(a){return g(a)},exports:function(a){var b=r[a];return void 0!==b?b:r[a]={}},module:function(a){return{id:a,uri:"",exports:r[a],config:m(a)}}},n=function(a,c,d,f){var h,k,m,n,o,t,v,w=[],x=typeof d;if(f=f||a,t=l(f),"undefined"===x||"function"===x){for(c=!c.length&&d.length?["require","exports","module"]:c,o=0;o<c.length;o+=1)if(n=p(c[o],t),"require"===(k=n.f))w[o]=q.require(a);else if("exports"===k)w[o]=q.exports(a),v=!0;else if("module"===k)h=w[o]=q.module(a);else if(e(r,k)||e(s,k)||e(u,k))w[o]=j(k);else{if(!n.p)throw new Error(a+" missing "+k);n.p.load(n.n,g(f,!0),i(k),{}),w[o]=r[k]}m=d?d.apply(r[a],w):void 0,a&&(h&&h.exports!==b&&h.exports!==r[a]?r[a]=h.exports:m===b&&v||(r[a]=m))}else a&&(r[a]=d)},a=c=o=function(a,c,d,e,f){if("string"==typeof a)return q[a]?q[a](c):j(p(a,l(c)).f);if(!a.splice){if(t=a,t.deps&&o(t.deps,t.callback),!c)return;c.splice?(a=c,c=d,d=null):a=b}return c=c||function(){},"function"==typeof d&&(d=e,e=f),e?n(b,a,c,d):setTimeout(function(){n(b,a,c,d)},4),o},o.config=function(a){return o(a)},a._defined=r,d=function(a,b,c){if("string"!=typeof a)throw new Error("See almond README: incorrect module build, no module name");b.splice||(c=b,b=[]),e(r,a)||e(s,a)||(s[a]=[a,b,c])},d.amd={jQuery:!0}}(),b.requirejs=a,b.require=c,b.define=d}}(),b.define("almond",function(){}),b.define("jquery",[],function(){var b=a||$;return null==b&&console&&console.error&&console.error("Select2: An instance of jQuery or a jQuery-compatible library was not found. Make sure that you are including jQuery before Select2 on your web page."),b}),b.define("select2/utils",["jquery"],function(a){function b(a){var b=a.prototype,c=[];for(var d in b){"function"==typeof b[d]&&("constructor"!==d&&c.push(d))}return c}var c={};c.Extend=function(a,b){function c(){this.constructor=a}var d={}.hasOwnProperty;for(var e in b)d.call(b,e)&&(a[e]=b[e]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},c.Decorate=function(a,c){function d(){var b=Array.prototype.unshift,d=c.prototype.constructor.length,e=a.prototype.constructor;d>0&&(b.call(arguments,a.prototype.constructor),e=c.prototype.constructor),e.apply(this,arguments)}function e(){this.constructor=d}var f=b(c),g=b(a);c.displayName=a.displayName,d.prototype=new e;for(var h=0;h<g.length;h++){var i=g[h];d.prototype[i]=a.prototype[i]}for(var j=(function(a){var b=function(){};a in d.prototype&&(b=d.prototype[a]);var e=c.prototype[a];return function(){return Array.prototype.unshift.call(arguments,b),e.apply(this,arguments)}}),k=0;k<f.length;k++){var l=f[k];d.prototype[l]=j(l)}return d};var d=function(){this.listeners={}};return d.prototype.on=function(a,b){this.listeners=this.listeners||{},a in this.listeners?this.listeners[a].push(b):this.listeners[a]=[b]},d.prototype.trigger=function(a){var b=Array.prototype.slice,c=b.call(arguments,1);this.listeners=this.listeners||{},null==c&&(c=[]),0===c.length&&c.push({}),c[0]._type=a,a in this.listeners&&this.invoke(this.listeners[a],b.call(arguments,1)),"*"in this.listeners&&this.invoke(this.listeners["*"],arguments)},d.prototype.invoke=function(a,b){for(var c=0,d=a.length;c<d;c++)a[c].apply(this,b)},c.Observable=d,c.generateChars=function(a){for(var b="",c=0;c<a;c++){b+=Math.floor(36*Math.random()).toString(36)}return b},c.bind=function(a,b){return function(){a.apply(b,arguments)}},c._convertData=function(a){for(var b in a){var c=b.split("-"),d=a;if(1!==c.length){for(var e=0;e<c.length;e++){var f=c[e];f=f.substring(0,1).toLowerCase()+f.substring(1),f in d||(d[f]={}),e==c.length-1&&(d[f]=a[b]),d=d[f]}delete a[b]}}return a},c.hasScroll=function(b,c){var d=a(c),e=c.style.overflowX,f=c.style.overflowY;return(e!==f||"hidden"!==f&&"visible"!==f)&&("scroll"===e||"scroll"===f||(d.innerHeight()<c.scrollHeight||d.innerWidth()<c.scrollWidth))},c.escapeMarkup=function(a){var b={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;"};return"string"!=typeof a?a:String(a).replace(/[&<>"'\/\\]/g,function(a){return b[a]})},c.appendMany=function(b,c){if("1.7"===a.fn.jquery.substr(0,3)){var d=a();a.map(c,function(a){d=d.add(a)}),c=d}b.append(c)},c}),b.define("select2/results",["jquery","./utils"],function(a,b){function c(a,b,d){this.$element=a,this.data=d,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<ul class="select2-results__options" role="tree"></ul>');return this.options.get("multiple")&&b.attr("aria-multiselectable","true"),this.$results=b,b},c.prototype.clear=function(){this.$results.empty()},c.prototype.displayMessage=function(b){var c=this.options.get("escapeMarkup");this.clear(),this.hideLoading();var d=a('<li role="treeitem" aria-live="assertive" class="select2-results__option"></li>'),e=this.options.get("translations").get(b.message);d.append(c(e(b.args))),d[0].className+=" select2-results__message",this.$results.append(d)},c.prototype.hideMessages=function(){this.$results.find(".select2-results__message").remove()},c.prototype.append=function(a){this.hideLoading();var b=[];if(null==a.results||0===a.results.length)return void(0===this.$results.children().length&&this.trigger("results:message",{message:"noResults"}));a.results=this.sort(a.results);for(var c=0;c<a.results.length;c++){var d=a.results[c],e=this.option(d);b.push(e)}this.$results.append(b)},c.prototype.position=function(a,b){b.find(".select2-results").append(a)},c.prototype.sort=function(a){return this.options.get("sorter")(a)},c.prototype.highlightFirstItem=function(){var a=this.$results.find(".select2-results__option[aria-selected]"),b=a.filter("[aria-selected=true]");b.length>0?b.first().trigger("mouseenter"):a.first().trigger("mouseenter"),this.ensureHighlightVisible()},c.prototype.setClasses=function(){var b=this;this.data.current(function(c){var d=a.map(c,function(a){return a.id.toString()});b.$results.find(".select2-results__option[aria-selected]").each(function(){var b=a(this),c=a.data(this,"data"),e=""+c.id;null!=c.element&&c.element.selected||null==c.element&&a.inArray(e,d)>-1?b.attr("aria-selected","true"):b.attr("aria-selected","false")})})},c.prototype.showLoading=function(a){this.hideLoading();var b=this.options.get("translations").get("searching"),c={disabled:!0,loading:!0,text:b(a)},d=this.option(c);d.className+=" loading-results",this.$results.prepend(d)},c.prototype.hideLoading=function(){this.$results.find(".loading-results").remove()},c.prototype.option=function(b){var c=document.createElement("li");c.className="select2-results__option";var d={role:"treeitem","aria-selected":"false"};b.disabled&&(delete d["aria-selected"],d["aria-disabled"]="true"),null==b.id&&delete d["aria-selected"],null!=b._resultId&&(c.id=b._resultId),b.title&&(c.title=b.title),b.children&&(d.role="group",d["aria-label"]=b.text,delete d["aria-selected"]);for(var e in d){var f=d[e];c.setAttribute(e,f)}if(b.children){var g=a(c),h=document.createElement("strong");h.className="select2-results__group";a(h);this.template(b,h);for(var i=[],j=0;j<b.children.length;j++){var k=b.children[j],l=this.option(k);i.push(l)}var m=a("<ul></ul>",{class:"select2-results__options select2-results__options--nested"});m.append(i),g.append(h),g.append(m)}else this.template(b,c);return a.data(c,"data",b),c},c.prototype.bind=function(b,c){var d=this,e=b.id+"-results";this.$results.attr("id",e),b.on("results:all",function(a){d.clear(),d.append(a.data),b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("results:append",function(a){d.append(a.data),b.isOpen()&&d.setClasses()}),b.on("query",function(a){d.hideMessages(),d.showLoading(a)}),b.on("select",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("unselect",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("open",function(){d.$results.attr("aria-expanded","true"),d.$results.attr("aria-hidden","false"),d.setClasses(),d.ensureHighlightVisible()}),b.on("close",function(){d.$results.attr("aria-expanded","false"),d.$results.attr("aria-hidden","true"),d.$results.removeAttr("aria-activedescendant")}),b.on("results:toggle",function(){var a=d.getHighlightedResults();0!==a.length&&a.trigger("mouseup")}),b.on("results:select",function(){var a=d.getHighlightedResults();if(0!==a.length){var b=a.data("data");"true"==a.attr("aria-selected")?d.trigger("close",{}):d.trigger("select",{data:b})}}),b.on("results:previous",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a);if(0!==c){var e=c-1;0===a.length&&(e=0);var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top,h=f.offset().top,i=d.$results.scrollTop()+(h-g);0===e?d.$results.scrollTop(0):h-g<0&&d.$results.scrollTop(i)}}),b.on("results:next",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a),e=c+1;if(!(e>=b.length)){var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top+d.$results.outerHeight(!1),h=f.offset().top+f.outerHeight(!1),i=d.$results.scrollTop()+h-g;0===e?d.$results.scrollTop(0):h>g&&d.$results.scrollTop(i)}}),b.on("results:focus",function(a){a.element.addClass("select2-results__option--highlighted")}),b.on("results:message",function(a){d.displayMessage(a)}),a.fn.mousewheel&&this.$results.on("mousewheel",function(a){var b=d.$results.scrollTop(),c=d.$results.get(0).scrollHeight-b+a.deltaY,e=a.deltaY>0&&b-a.deltaY<=0,f=a.deltaY<0&&c<=d.$results.height();e?(d.$results.scrollTop(0),a.preventDefault(),a.stopPropagation()):f&&(d.$results.scrollTop(d.$results.get(0).scrollHeight-d.$results.height()),a.preventDefault(),a.stopPropagation())}),this.$results.on("mouseup",".select2-results__option[aria-selected]",function(b){var c=a(this),e=c.data("data");if("true"===c.attr("aria-selected"))return void(d.options.get("multiple")?d.trigger("unselect",{originalEvent:b,data:e}):d.trigger("close",{}));d.trigger("select",{originalEvent:b,data:e})}),this.$results.on("mouseenter",".select2-results__option[aria-selected]",function(b){var c=a(this).data("data");d.getHighlightedResults().removeClass("select2-results__option--highlighted"),d.trigger("results:focus",{data:c,element:a(this)})})},c.prototype.getHighlightedResults=function(){return this.$results.find(".select2-results__option--highlighted")},c.prototype.destroy=function(){this.$results.remove()},c.prototype.ensureHighlightVisible=function(){var a=this.getHighlightedResults();if(0!==a.length){var b=this.$results.find("[aria-selected]"),c=b.index(a),d=this.$results.offset().top,e=a.offset().top,f=this.$results.scrollTop()+(e-d),g=e-d;f-=2*a.outerHeight(!1),c<=2?this.$results.scrollTop(0):(g>this.$results.outerHeight()||g<0)&&this.$results.scrollTop(f)}},c.prototype.template=function(b,c){var d=this.options.get("templateResult"),e=this.options.get("escapeMarkup"),f=d(b,c);null==f?c.style.display="none":"string"==typeof f?c.innerHTML=e(f):a(c).append(f)},c}),b.define("select2/keys",[],function(){return{BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,CTRL:17,ALT:18,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46}}),b.define("select2/selection/base",["jquery","../utils","../keys"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,b.Observable),d.prototype.render=function(){var b=a('<span class="select2-selection" role="combobox"  aria-haspopup="true" aria-expanded="false"></span>');return this._tabindex=0,null!=this.$element.data("old-tabindex")?this._tabindex=this.$element.data("old-tabindex"):null!=this.$element.attr("tabindex")&&(this._tabindex=this.$element.attr("tabindex")),b.attr("title",this.$element.attr("title")),b.attr("tabindex",this._tabindex),this.$selection=b,b},d.prototype.bind=function(a,b){var d=this,e=(a.id,a.id+"-results");this.container=a,this.$selection.on("focus",function(a){d.trigger("focus",a)}),this.$selection.on("blur",function(a){d._handleBlur(a)}),this.$selection.on("keydown",function(a){d.trigger("keypress",a),a.which===c.SPACE&&a.preventDefault()}),a.on("results:focus",function(a){d.$selection.attr("aria-activedescendant",a.data._resultId)}),a.on("selection:update",function(a){d.update(a.data)}),a.on("open",function(){d.$selection.attr("aria-expanded","true"),d.$selection.attr("aria-owns",e),d._attachCloseHandler(a)}),a.on("close",function(){d.$selection.attr("aria-expanded","false"),d.$selection.removeAttr("aria-activedescendant"),d.$selection.removeAttr("aria-owns"),d.$selection.focus(),d._detachCloseHandler(a)}),a.on("enable",function(){d.$selection.attr("tabindex",d._tabindex)}),a.on("disable",function(){d.$selection.attr("tabindex","-1")})},d.prototype._handleBlur=function(b){var c=this;window.setTimeout(function(){document.activeElement==c.$selection[0]||a.contains(c.$selection[0],document.activeElement)||c.trigger("blur",b)},1)},d.prototype._attachCloseHandler=function(b){a(document.body).on("mousedown.select2."+b.id,function(b){var c=a(b.target),d=c.closest(".select2");a(".select2.select2-container--open").each(function(){var b=a(this);this!=d[0]&&b.data("element").select2("close")})})},d.prototype._detachCloseHandler=function(b){a(document.body).off("mousedown.select2."+b.id)},d.prototype.position=function(a,b){b.find(".selection").append(a)},d.prototype.destroy=function(){this._detachCloseHandler(this.container)},d.prototype.update=function(a){throw new Error("The `update` method must be defined in child classes.")},d}),b.define("select2/selection/single",["jquery","./base","../utils","../keys"],function(a,b,c,d){function e(){e.__super__.constructor.apply(this,arguments)}return c.Extend(e,b),e.prototype.render=function(){var a=e.__super__.render.call(this);return a.addClass("select2-selection--single"),a.html('<span class="select2-selection__rendered"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'),a},e.prototype.bind=function(a,b){var c=this;e.__super__.bind.apply(this,arguments);var d=a.id+"-container";this.$selection.find(".select2-selection__rendered").attr("id",d),this.$selection.attr("aria-labelledby",d),this.$selection.on("mousedown",function(a){1===a.which&&c.trigger("toggle",{originalEvent:a})}),this.$selection.on("focus",function(a){}),this.$selection.on("blur",function(a){}),a.on("focus",function(b){a.isOpen()||c.$selection.focus()}),a.on("selection:update",function(a){c.update(a.data)})},e.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},e.prototype.display=function(a,b){var c=this.options.get("templateSelection");return this.options.get("escapeMarkup")(c(a,b))},e.prototype.selectionContainer=function(){return a("<span></span>")},e.prototype.update=function(a){if(0===a.length)return void this.clear();var b=a[0],c=this.$selection.find(".select2-selection__rendered"),d=this.display(b,c);c.empty().append(d),c.prop("title",b.title||b.text)},e}),b.define("select2/selection/multiple",["jquery","./base","../utils"],function(a,b,c){function d(a,b){d.__super__.constructor.apply(this,arguments)}return c.Extend(d,b),d.prototype.render=function(){var a=d.__super__.render.call(this);return a.addClass("select2-selection--multiple"),a.html('<ul class="select2-selection__rendered"></ul>'),a},d.prototype.bind=function(b,c){var e=this;d.__super__.bind.apply(this,arguments),this.$selection.on("click",function(a){e.trigger("toggle",{originalEvent:a})}),this.$selection.on("click",".select2-selection__choice__remove",function(b){if(!e.options.get("disabled")){var c=a(this),d=c.parent(),f=d.data("data");e.trigger("unselect",{originalEvent:b,data:f})}})},d.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},d.prototype.display=function(a,b){var c=this.options.get("templateSelection");return this.options.get("escapeMarkup")(c(a,b))},d.prototype.selectionContainer=function(){return a('<li class="select2-selection__choice"><span class="select2-selection__choice__remove" role="presentation">&times;</span></li>')},d.prototype.update=function(a){if(this.clear(),0!==a.length){for(var b=[],d=0;d<a.length;d++){var e=a[d],f=this.selectionContainer(),g=this.display(e,f);f.append(g),f.prop("title",e.title||e.text),f.data("data",e),b.push(f)}var h=this.$selection.find(".select2-selection__rendered");c.appendMany(h,b)}},d}),b.define("select2/selection/placeholder",["../utils"],function(a){function b(a,b,c){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c)}return b.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},b.prototype.createPlaceholder=function(a,b){var c=this.selectionContainer();return c.html(this.display(b)),c.addClass("select2-selection__placeholder").removeClass("select2-selection__choice"),c},b.prototype.update=function(a,b){var c=1==b.length&&b[0].id!=this.placeholder.id;if(b.length>1||c)return a.call(this,b);this.clear();var d=this.createPlaceholder(this.placeholder);this.$selection.find(".select2-selection__rendered").append(d)},b}),b.define("select2/selection/allowClear",["jquery","../keys"],function(a,b){function c(){}return c.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),null==this.placeholder&&this.options.get("debug")&&window.console&&console.error&&console.error("Select2: The `allowClear` option should be used in combination with the `placeholder` option."),this.$selection.on("mousedown",".select2-selection__clear",function(a){d._handleClear(a)}),b.on("keypress",function(a){d._handleKeyboardClear(a,b)})},c.prototype._handleClear=function(a,b){if(!this.options.get("disabled")){var c=this.$selection.find(".select2-selection__clear");if(0!==c.length){b.stopPropagation();for(var d=c.data("data"),e=0;e<d.length;e++){var f={data:d[e]};if(this.trigger("unselect",f),f.prevented)return}this.$element.val(this.placeholder.id).trigger("change"),this.trigger("toggle",{})}}},c.prototype._handleKeyboardClear=function(a,c,d){d.isOpen()||c.which!=b.DELETE&&c.which!=b.BACKSPACE||this._handleClear(c)},c.prototype.update=function(b,c){if(b.call(this,c),!(this.$selection.find(".select2-selection__placeholder").length>0||0===c.length)){var d=a('<span class="select2-selection__clear">&times;</span>');d.data("data",c),this.$selection.find(".select2-selection__rendered").prepend(d)}},c}),b.define("select2/selection/search",["jquery","../utils","../keys"],function(a,b,c){function d(a,b,c){a.call(this,b,c)}return d.prototype.render=function(b){var c=a('<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" aria-autocomplete="list" /></li>');this.$searchContainer=c,this.$search=c.find("input");var d=b.call(this);return this._transferTabIndex(),d},d.prototype.bind=function(a,b,d){var e=this;a.call(this,b,d),b.on("open",function(){e.$search.trigger("focus")}),b.on("close",function(){e.$search.val(""),e.$search.removeAttr("aria-activedescendant"),e.$search.trigger("focus")}),b.on("enable",function(){e.$search.prop("disabled",!1),e._transferTabIndex()}),b.on("disable",function(){e.$search.prop("disabled",!0)}),b.on("focus",function(a){e.$search.trigger("focus")}),b.on("results:focus",function(a){e.$search.attr("aria-activedescendant",a.id)}),this.$selection.on("focusin",".select2-search--inline",function(a){e.trigger("focus",a)}),this.$selection.on("focusout",".select2-search--inline",function(a){e._handleBlur(a)}),this.$selection.on("keydown",".select2-search--inline",function(a){if(a.stopPropagation(),e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented(),a.which===c.BACKSPACE&&""===e.$search.val()){var b=e.$searchContainer.prev(".select2-selection__choice");if(b.length>0){var d=b.data("data");e.searchRemoveChoice(d),a.preventDefault()}}});var f=document.documentMode,g=f&&f<=11;this.$selection.on("input.searchcheck",".select2-search--inline",function(a){if(g)return void e.$selection.off("input.search input.searchcheck");e.$selection.off("keyup.search")}),this.$selection.on("keyup.search input.search",".select2-search--inline",function(a){if(g&&"input"===a.type)return void e.$selection.off("input.search input.searchcheck");var b=a.which;b!=c.SHIFT&&b!=c.CTRL&&b!=c.ALT&&b!=c.TAB&&e.handleSearch(a)})},d.prototype._transferTabIndex=function(a){this.$search.attr("tabindex",this.$selection.attr("tabindex")),this.$selection.attr("tabindex","-1")},d.prototype.createPlaceholder=function(a,b){this.$search.attr("placeholder",b.text)},d.prototype.update=function(a,b){var c=this.$search[0]==document.activeElement;this.$search.attr("placeholder",""),a.call(this,b),this.$selection.find(".select2-selection__rendered").append(this.$searchContainer),this.resizeSearch(),c&&this.$search.focus()},d.prototype.handleSearch=function(){if(this.resizeSearch(),!this._keyUpPrevented){var a=this.$search.val();this.trigger("query",{term:a})}this._keyUpPrevented=!1},d.prototype.searchRemoveChoice=function(a,b){this.trigger("unselect",{data:b}),this.$search.val(b.text),this.handleSearch()},d.prototype.resizeSearch=function(){this.$search.css("width","25px");var a="";if(""!==this.$search.attr("placeholder"))a=this.$selection.find(".select2-selection__rendered").innerWidth();else{a=.75*(this.$search.val().length+1)+"em"}this.$search.css("width",a)},d}),b.define("select2/selection/eventRelay",["jquery"],function(a){function b(){}return b.prototype.bind=function(b,c,d){var e=this,f=["open","opening","close","closing","select","selecting","unselect","unselecting"],g=["opening","closing","selecting","unselecting"];b.call(this,c,d),c.on("*",function(b,c){if(-1!==a.inArray(b,f)){c=c||{};var d=a.Event("select2:"+b,{params:c});e.$element.trigger(d),-1!==a.inArray(b,g)&&(c.prevented=d.isDefaultPrevented())}})},b}),b.define("select2/translation",["jquery","require"],function(a,b){function c(a){this.dict=a||{}}return c.prototype.all=function(){return this.dict},c.prototype.get=function(a){return this.dict[a]},c.prototype.extend=function(b){this.dict=a.extend({},b.all(),this.dict)},c._cache={},c.loadPath=function(a){if(!(a in c._cache)){var d=b(a);c._cache[a]=d}return new c(c._cache[a])},c}),b.define("select2/diacritics",[],function(){return{"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"}}),b.define("select2/data/base",["../utils"],function(a){function b(a,c){b.__super__.constructor.call(this)}return a.Extend(b,a.Observable),b.prototype.current=function(a){throw new Error("The `current` method must be defined in child classes.")},b.prototype.query=function(a,b){throw new Error("The `query` method must be defined in child classes.")},b.prototype.bind=function(a,b){},b.prototype.destroy=function(){},b.prototype.generateResultId=function(b,c){var d=b.id+"-result-";return d+=a.generateChars(4),null!=c.id?d+="-"+c.id.toString():d+="-"+a.generateChars(4),d},b}),b.define("select2/data/select",["./base","../utils","jquery"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,a),d.prototype.current=function(a){var b=[],d=this;this.$element.find(":selected").each(function(){var a=c(this),e=d.item(a);b.push(e)}),a(b)},d.prototype.select=function(a){var b=this;if(a.selected=!0,c(a.element).is("option"))return a.element.selected=!0,void this.$element.trigger("change");if(this.$element.prop("multiple"))this.current(function(d){var e=[];a=[a],a.push.apply(a,d);for(var f=0;f<a.length;f++){var g=a[f].id;-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")});else{var d=a.id;this.$element.val(d),this.$element.trigger("change")}},d.prototype.unselect=function(a){var b=this;if(this.$element.prop("multiple")){if(a.selected=!1,c(a.element).is("option"))return a.element.selected=!1,void this.$element.trigger("change");this.current(function(d){for(var e=[],f=0;f<d.length;f++){var g=d[f].id;g!==a.id&&-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")})}},d.prototype.bind=function(a,b){var c=this;this.container=a,a.on("select",function(a){c.select(a.data)}),a.on("unselect",function(a){c.unselect(a.data)})},d.prototype.destroy=function(){this.$element.find("*").each(function(){c.removeData(this,"data")})},d.prototype.query=function(a,b){var d=[],e=this;this.$element.children().each(function(){var b=c(this);if(b.is("option")||b.is("optgroup")){var f=e.item(b),g=e.matches(a,f);null!==g&&d.push(g)}}),b({results:d})},d.prototype.addOptions=function(a){b.appendMany(this.$element,a)},d.prototype.option=function(a){var b;a.children?(b=document.createElement("optgroup"),b.label=a.text):(b=document.createElement("option"),void 0!==b.textContent?b.textContent=a.text:b.innerText=a.text),void 0!==a.id&&(b.value=a.id),a.disabled&&(b.disabled=!0),a.selected&&(b.selected=!0),a.title&&(b.title=a.title);var d=c(b),e=this._normalizeItem(a);return e.element=b,c.data(b,"data",e),d},d.prototype.item=function(a){var b={};if(null!=(b=c.data(a[0],"data")))return b;if(a.is("option"))b={id:a.val(),text:a.text(),disabled:a.prop("disabled"),selected:a.prop("selected"),title:a.prop("title")};else if(a.is("optgroup")){b={text:a.prop("label"),children:[],title:a.prop("title")};for(var d=a.children("option"),e=[],f=0;f<d.length;f++){var g=c(d[f]),h=this.item(g);e.push(h)}b.children=e}return b=this._normalizeItem(b),b.element=a[0],c.data(a[0],"data",b),b},d.prototype._normalizeItem=function(a){c.isPlainObject(a)||(a={id:a,text:a}),a=c.extend({},{text:""},a);var b={selected:!1,disabled:!1};return null!=a.id&&(a.id=a.id.toString()),null!=a.text&&(a.text=a.text.toString()),null==a._resultId&&a.id&&null!=this.container&&(a._resultId=this.generateResultId(this.container,a)),c.extend({},b,a)},d.prototype.matches=function(a,b){return this.options.get("matcher")(a,b)},d}),b.define("select2/data/array",["./select","../utils","jquery"],function(a,b,c){function d(a,b){var c=b.get("data")||[];d.__super__.constructor.call(this,a,b),this.addOptions(this.convertToOptions(c))}return b.Extend(d,a),d.prototype.select=function(a){var b=this.$element.find("option").filter(function(b,c){return c.value==a.id.toString()});0===b.length&&(b=this.option(a),this.addOptions(b)),d.__super__.select.call(this,a)},d.prototype.convertToOptions=function(a){function d(a){return function(){return c(this).val()==a.id}}for(var e=this,f=this.$element.find("option"),g=f.map(function(){return e.item(c(this)).id}).get(),h=[],i=0;i<a.length;i++){var j=this._normalizeItem(a[i]);if(c.inArray(j.id,g)>=0){var k=f.filter(d(j)),l=this.item(k),m=c.extend(!0,{},j,l),n=this.option(m);k.replaceWith(n)}else{var o=this.option(j);if(j.children){var p=this.convertToOptions(j.children);b.appendMany(o,p)}h.push(o)}}return h},d}),b.define("select2/data/ajax",["./array","../utils","jquery"],function(a,b,c){function d(a,b){this.ajaxOptions=this._applyDefaults(b.get("ajax")),null!=this.ajaxOptions.processResults&&(this.processResults=this.ajaxOptions.processResults),d.__super__.constructor.call(this,a,b)}return b.Extend(d,a),d.prototype._applyDefaults=function(a){var b={data:function(a){return c.extend({},a,{q:a.term})},transport:function(a,b,d){var e=c.ajax(a);return e.then(b),e.fail(d),e}};return c.extend({},b,a,!0)},d.prototype.processResults=function(a){return a},d.prototype.query=function(a,b){function d(){var d=f.transport(f,function(d){var f=e.processResults(d,a);e.options.get("debug")&&window.console&&console.error&&(f&&f.results&&c.isArray(f.results)||console.error("Select2: The AJAX results did not return an array in the `results` key of the response.")),b(f)},function(){d.status&&"0"===d.status||e.trigger("results:message",{message:"errorLoading"})});e._request=d}var e=this;null!=this._request&&(c.isFunction(this._request.abort)&&this._request.abort(),this._request=null);var f=c.extend({type:"GET"},this.ajaxOptions);"function"==typeof f.url&&(f.url=f.url.call(this.$element,a)),"function"==typeof f.data&&(f.data=f.data.call(this.$element,a)),this.ajaxOptions.delay&&null!=a.term?(this._queryTimeout&&window.clearTimeout(this._queryTimeout),this._queryTimeout=window.setTimeout(d,this.ajaxOptions.delay)):d()},d}),b.define("select2/data/tags",["jquery"],function(a){function b(b,c,d){var e=d.get("tags"),f=d.get("createTag");void 0!==f&&(this.createTag=f);var g=d.get("insertTag");if(void 0!==g&&(this.insertTag=g),b.call(this,c,d),a.isArray(e))for(var h=0;h<e.length;h++){var i=e[h],j=this._normalizeItem(i),k=this.option(j);this.$element.append(k)}}return b.prototype.query=function(a,b,c){function d(a,f){for(var g=a.results,h=0;h<g.length;h++){var i=g[h],j=null!=i.children&&!d({results:i.children},!0);if((i.text||"").toUpperCase()===(b.term||"").toUpperCase()||j)return!f&&(a.data=g,void c(a))}if(f)return!0;var k=e.createTag(b);if(null!=k){var l=e.option(k);l.attr("data-select2-tag",!0),e.addOptions([l]),e.insertTag(g,k)}a.results=g,c(a)}var e=this;if(this._removeOldTags(),null==b.term||null!=b.page)return void a.call(this,b,c);a.call(this,b,d)},b.prototype.createTag=function(b,c){var d=a.trim(c.term);return""===d?null:{id:d,text:d}},b.prototype.insertTag=function(a,b,c){b.unshift(c)},b.prototype._removeOldTags=function(b){this._lastTag;this.$element.find("option[data-select2-tag]").each(function(){this.selected||a(this).remove()})},b}),b.define("select2/data/tokenizer",["jquery"],function(a){function b(a,b,c){var d=c.get("tokenizer");void 0!==d&&(this.tokenizer=d),a.call(this,b,c)}return b.prototype.bind=function(a,b,c){a.call(this,b,c),this.$search=b.dropdown.$search||b.selection.$search||c.find(".select2-search__field")},b.prototype.query=function(b,c,d){function e(b){var c=g._normalizeItem(b);if(!g.$element.find("option").filter(function(){return a(this).val()===c.id}).length){var d=g.option(c);d.attr("data-select2-tag",!0),g._removeOldTags(),g.addOptions([d])}f(c)}function f(a){g.trigger("select",{data:a})}var g=this;c.term=c.term||"";var h=this.tokenizer(c,this.options,e);h.term!==c.term&&(this.$search.length&&(this.$search.val(h.term),this.$search.focus()),c.term=h.term),b.call(this,c,d)},b.prototype.tokenizer=function(b,c,d,e){for(var f=d.get("tokenSeparators")||[],g=c.term,h=0,i=this.createTag||function(a){return{id:a.term,text:a.term}};h<g.length;){var j=g[h];if(-1!==a.inArray(j,f)){var k=g.substr(0,h),l=a.extend({},c,{term:k}),m=i(l);null!=m?(e(m),g=g.substr(h+1)||"",h=0):h++}else h++}return{term:g}},b}),b.define("select2/data/minimumInputLength",[],function(){function a(a,b,c){this.minimumInputLength=c.get("minimumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){if(b.term=b.term||"",b.term.length<this.minimumInputLength)return void this.trigger("results:message",{message:"inputTooShort",args:{minimum:this.minimumInputLength,input:b.term,params:b}});a.call(this,b,c)},a}),b.define("select2/data/maximumInputLength",[],function(){function a(a,b,c){this.maximumInputLength=c.get("maximumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){if(b.term=b.term||"",this.maximumInputLength>0&&b.term.length>this.maximumInputLength)return void this.trigger("results:message",{message:"inputTooLong",args:{maximum:this.maximumInputLength,input:b.term,params:b}});a.call(this,b,c)},a}),b.define("select2/data/maximumSelectionLength",[],function(){function a(a,b,c){this.maximumSelectionLength=c.get("maximumSelectionLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){var d=this;this.current(function(e){var f=null!=e?e.length:0;if(d.maximumSelectionLength>0&&f>=d.maximumSelectionLength)return void d.trigger("results:message",{message:"maximumSelected",args:{maximum:d.maximumSelectionLength}});a.call(d,b,c)})},a}),b.define("select2/dropdown",["jquery","./utils"],function(a,b){function c(a,b){this.$element=a,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<span class="select2-dropdown"><span class="select2-results"></span></span>');return b.attr("dir",this.options.get("dir")),this.$dropdown=b,b},c.prototype.bind=function(){},c.prototype.position=function(a,b){},c.prototype.destroy=function(){this.$dropdown.remove()},c}),b.define("select2/dropdown/search",["jquery","../utils"],function(a,b){function c(){}return c.prototype.render=function(b){var c=b.call(this),d=a('<span class="select2-search select2-search--dropdown"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" /></span>');return this.$searchContainer=d,this.$search=d.find("input"),c.prepend(d),c},c.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),this.$search.on("keydown",function(a){e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented()}),this.$search.on("input",function(b){a(this).off("keyup")}),this.$search.on("keyup input",function(a){e.handleSearch(a)}),c.on("open",function(){e.$search.attr("tabindex",0),e.$search.focus(),window.setTimeout(function(){e.$search.focus()},0)}),c.on("close",function(){e.$search.attr("tabindex",-1),e.$search.val("")}),c.on("focus",function(){c.isOpen()||e.$search.focus()}),c.on("results:all",function(a){if(null==a.query.term||""===a.query.term){e.showSearch(a)?e.$searchContainer.removeClass("select2-search--hide"):e.$searchContainer.addClass("select2-search--hide")}})},c.prototype.handleSearch=function(a){if(!this._keyUpPrevented){var b=this.$search.val();this.trigger("query",{term:b})}this._keyUpPrevented=!1},c.prototype.showSearch=function(a,b){return!0},c}),b.define("select2/dropdown/hidePlaceholder",[],function(){function a(a,b,c,d){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c,d)}return a.prototype.append=function(a,b){b.results=this.removePlaceholder(b.results),a.call(this,b)},a.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},a.prototype.removePlaceholder=function(a,b){for(var c=b.slice(0),d=b.length-1;d>=0;d--){var e=b[d];this.placeholder.id===e.id&&c.splice(d,1)}return c},a}),b.define("select2/dropdown/infiniteScroll",["jquery"],function(a){function b(a,b,c,d){this.lastParams={},a.call(this,b,c,d),this.$loadingMore=this.createLoadingMore(),this.loading=!1}return b.prototype.append=function(a,b){this.$loadingMore.remove(),this.loading=!1,a.call(this,b),this.showLoadingMore(b)&&this.$results.append(this.$loadingMore)},b.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),c.on("query",function(a){e.lastParams=a,e.loading=!0}),c.on("query:append",function(a){e.lastParams=a,e.loading=!0}),this.$results.on("scroll",function(){var b=a.contains(document.documentElement,e.$loadingMore[0]);if(!e.loading&&b){e.$results.offset().top+e.$results.outerHeight(!1)+50>=e.$loadingMore.offset().top+e.$loadingMore.outerHeight(!1)&&e.loadMore()}})},b.prototype.loadMore=function(){this.loading=!0;var b=a.extend({},{page:1},this.lastParams);b.page++,this.trigger("query:append",b)},b.prototype.showLoadingMore=function(a,b){return b.pagination&&b.pagination.more},b.prototype.createLoadingMore=function(){var b=a('<li class="select2-results__option select2-results__option--load-more"role="treeitem" aria-disabled="true"></li>'),c=this.options.get("translations").get("loadingMore");return b.html(c(this.lastParams)),b},b}),b.define("select2/dropdown/attachBody",["jquery","../utils"],function(a,b){function c(b,c,d){this.$dropdownParent=d.get("dropdownParent")||a(document.body),b.call(this,c,d)}return c.prototype.bind=function(a,b,c){var d=this,e=!1;a.call(this,b,c),b.on("open",function(){d._showDropdown(),d._attachPositioningHandler(b),e||(e=!0,b.on("results:all",function(){d._positionDropdown(),d._resizeDropdown()}),b.on("results:append",function(){d._positionDropdown(),d._resizeDropdown()}))}),b.on("close",function(){d._hideDropdown(),d._detachPositioningHandler(b)}),this.$dropdownContainer.on("mousedown",function(a){a.stopPropagation()})},c.prototype.destroy=function(a){a.call(this),this.$dropdownContainer.remove()},c.prototype.position=function(a,b,c){b.attr("class",c.attr("class")),b.removeClass("select2"),b.addClass("select2-container--open"),b.css({position:"absolute",top:-999999}),this.$container=c},c.prototype.render=function(b){var c=a("<span></span>"),d=b.call(this);return c.append(d),this.$dropdownContainer=c,c},c.prototype._hideDropdown=function(a){this.$dropdownContainer.detach()},c.prototype._attachPositioningHandler=function(c,d){var e=this,f="scroll.select2."+d.id,g="resize.select2."+d.id,h="orientationchange.select2."+d.id,i=this.$container.parents().filter(b.hasScroll);i.each(function(){a(this).data("select2-scroll-position",{x:a(this).scrollLeft(),y:a(this).scrollTop()})}),i.on(f,function(b){var c=a(this).data("select2-scroll-position");a(this).scrollTop(c.y)}),a(window).on(f+" "+g+" "+h,function(a){e._positionDropdown(),e._resizeDropdown()})},c.prototype._detachPositioningHandler=function(c,d){var e="scroll.select2."+d.id,f="resize.select2."+d.id,g="orientationchange.select2."+d.id;this.$container.parents().filter(b.hasScroll).off(e),a(window).off(e+" "+f+" "+g)},c.prototype._positionDropdown=function(){var b=a(window),c=this.$dropdown.hasClass("select2-dropdown--above"),d=this.$dropdown.hasClass("select2-dropdown--below"),e=null,f=this.$container.offset();f.bottom=f.top+this.$container.outerHeight(!1);var g={height:this.$container.outerHeight(!1)};g.top=f.top,g.bottom=f.top+g.height;var h={height:this.$dropdown.outerHeight(!1)},i={top:b.scrollTop(),bottom:b.scrollTop()+b.height()},j=i.top<f.top-h.height,k=i.bottom>f.bottom+h.height,l={left:f.left,top:g.bottom},m=this.$dropdownParent;"static"===m.css("position")&&(m=m.offsetParent());var n=m.offset();l.top-=n.top,l.left-=n.left,c||d||(e="below"),k||!j||c?!j&&k&&c&&(e="below"):e="above",("above"==e||c&&"below"!==e)&&(l.top=g.top-n.top-h.height),null!=e&&(this.$dropdown.removeClass("select2-dropdown--below select2-dropdown--above").addClass("select2-dropdown--"+e),this.$container.removeClass("select2-container--below select2-container--above").addClass("select2-container--"+e)),this.$dropdownContainer.css(l)},c.prototype._resizeDropdown=function(){var a={width:this.$container.outerWidth(!1)+"px"};this.options.get("dropdownAutoWidth")&&(a.minWidth=a.width,a.position="relative",a.width="auto"),this.$dropdown.css(a)},c.prototype._showDropdown=function(a){this.$dropdownContainer.appendTo(this.$dropdownParent),this._positionDropdown(),this._resizeDropdown()},c}),b.define("select2/dropdown/minimumResultsForSearch",[],function(){function a(b){for(var c=0,d=0;d<b.length;d++){var e=b[d];e.children?c+=a(e.children):c++}return c}function b(a,b,c,d){this.minimumResultsForSearch=c.get("minimumResultsForSearch"),this.minimumResultsForSearch<0&&(this.minimumResultsForSearch=1/0),a.call(this,b,c,d)}return b.prototype.showSearch=function(b,c){return!(a(c.data.results)<this.minimumResultsForSearch)&&b.call(this,c)},b}),b.define("select2/dropdown/selectOnClose",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("close",function(a){d._handleSelectOnClose(a)})},a.prototype._handleSelectOnClose=function(a,b){if(b&&null!=b.originalSelect2Event){var c=b.originalSelect2Event;if("select"===c._type||"unselect"===c._type)return}var d=this.getHighlightedResults();if(!(d.length<1)){var e=d.data("data");null!=e.element&&e.element.selected||null==e.element&&e.selected||this.trigger("select",{data:e})}},a}),b.define("select2/dropdown/closeOnSelect",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("select",function(a){d._selectTriggered(a)}),b.on("unselect",function(a){d._selectTriggered(a)})},a.prototype._selectTriggered=function(a,b){var c=b.originalEvent;c&&c.ctrlKey||this.trigger("close",{originalEvent:c,originalSelect2Event:b})},a}),b.define("select2/i18n/en",[],function(){return{errorLoading:function(){return"The results could not be loaded."},inputTooLong:function(a){var b=a.input.length-a.maximum,c="Please delete "+b+" character";return 1!=b&&(c+="s"),c},inputTooShort:function(a){return"Please enter "+(a.minimum-a.input.length)+" or more characters"},loadingMore:function(){return"Loading more results…"},maximumSelected:function(a){var b="You can only select "+a.maximum+" item";return 1!=a.maximum&&(b+="s"),b},noResults:function(){return"No results found"},searching:function(){return"Searching…"}}}),b.define("select2/defaults",["jquery","require","./results","./selection/single","./selection/multiple","./selection/placeholder","./selection/allowClear","./selection/search","./selection/eventRelay","./utils","./translation","./diacritics","./data/select","./data/array","./data/ajax","./data/tags","./data/tokenizer","./data/minimumInputLength","./data/maximumInputLength","./data/maximumSelectionLength","./dropdown","./dropdown/search","./dropdown/hidePlaceholder","./dropdown/infiniteScroll","./dropdown/attachBody","./dropdown/minimumResultsForSearch","./dropdown/selectOnClose","./dropdown/closeOnSelect","./i18n/en"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C){function D(){this.reset()}return D.prototype.apply=function(l){if(l=a.extend(!0,{},this.defaults,l),null==l.dataAdapter){if(null!=l.ajax?l.dataAdapter=o:null!=l.data?l.dataAdapter=n:l.dataAdapter=m,l.minimumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,r)),l.maximumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,s)),l.maximumSelectionLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,t)),l.tags&&(l.dataAdapter=j.Decorate(l.dataAdapter,p)),null==l.tokenSeparators&&null==l.tokenizer||(l.dataAdapter=j.Decorate(l.dataAdapter,q)),null!=l.query){var C=b(l.amdBase+"compat/query");l.dataAdapter=j.Decorate(l.dataAdapter,C)}if(null!=l.initSelection){var D=b(l.amdBase+"compat/initSelection");l.dataAdapter=j.Decorate(l.dataAdapter,D)}}if(null==l.resultsAdapter&&(l.resultsAdapter=c,null!=l.ajax&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,x)),null!=l.placeholder&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,w)),l.selectOnClose&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,A))),null==l.dropdownAdapter){if(l.multiple)l.dropdownAdapter=u;else{var E=j.Decorate(u,v);l.dropdownAdapter=E}if(0!==l.minimumResultsForSearch&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,z)),l.closeOnSelect&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,B)),null!=l.dropdownCssClass||null!=l.dropdownCss||null!=l.adaptDropdownCssClass){var F=b(l.amdBase+"compat/dropdownCss");l.dropdownAdapter=j.Decorate(l.dropdownAdapter,F)}l.dropdownAdapter=j.Decorate(l.dropdownAdapter,y)}if(null==l.selectionAdapter){if(l.multiple?l.selectionAdapter=e:l.selectionAdapter=d,null!=l.placeholder&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,f)),l.allowClear&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,g)),l.multiple&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,h)),null!=l.containerCssClass||null!=l.containerCss||null!=l.adaptContainerCssClass){var G=b(l.amdBase+"compat/containerCss");l.selectionAdapter=j.Decorate(l.selectionAdapter,G)}l.selectionAdapter=j.Decorate(l.selectionAdapter,i)}if("string"==typeof l.language)if(l.language.indexOf("-")>0){var H=l.language.split("-"),I=H[0];l.language=[l.language,I]}else l.language=[l.language];if(a.isArray(l.language)){var J=new k;l.language.push("en");for(var K=l.language,L=0;L<K.length;L++){var M=K[L],N={};try{N=k.loadPath(M)}catch(a){try{M=this.defaults.amdLanguageBase+M,N=k.loadPath(M)}catch(a){l.debug&&window.console&&console.warn&&console.warn('Select2: The language file for "'+M+'" could not be automatically loaded. A fallback will be used instead.');continue}}J.extend(N)}l.translations=J}else{var O=k.loadPath(this.defaults.amdLanguageBase+"en"),P=new k(l.language);P.extend(O),l.translations=P}return l},D.prototype.reset=function(){function b(a){function b(a){return l[a]||a}return a.replace(/[^\u0000-\u007E]/g,b)}function c(d,e){if(""===a.trim(d.term))return e;if(e.children&&e.children.length>0){for(var f=a.extend(!0,{},e),g=e.children.length-1;g>=0;g--){null==c(d,e.children[g])&&f.children.splice(g,1)}return f.children.length>0?f:c(d,f)}var h=b(e.text).toUpperCase(),i=b(d.term).toUpperCase();return h.indexOf(i)>-1?e:null}this.defaults={amdBase:"./",amdLanguageBase:"./i18n/",closeOnSelect:!0,debug:!1,dropdownAutoWidth:!1,escapeMarkup:j.escapeMarkup,language:C,matcher:c,minimumInputLength:0,maximumInputLength:0,maximumSelectionLength:0,minimumResultsForSearch:0,selectOnClose:!1,sorter:function(a){return a},templateResult:function(a){return a.text},templateSelection:function(a){return a.text},theme:"default",width:"resolve"}},D.prototype.set=function(b,c){var d=a.camelCase(b),e={};e[d]=c;var f=j._convertData(e);a.extend(this.defaults,f)},new D}),b.define("select2/options",["require","jquery","./defaults","./utils"],function(a,b,c,d){function e(b,e){if(this.options=b,null!=e&&this.fromElement(e),this.options=c.apply(this.options),e&&e.is("input")){var f=a(this.get("amdBase")+"compat/inputData");this.options.dataAdapter=d.Decorate(this.options.dataAdapter,f)}}return e.prototype.fromElement=function(a){var c=["select2"];null==this.options.multiple&&(this.options.multiple=a.prop("multiple")),null==this.options.disabled&&(this.options.disabled=a.prop("disabled")),null==this.options.language&&(a.prop("lang")?this.options.language=a.prop("lang").toLowerCase():a.closest("[lang]").prop("lang")&&(this.options.language=a.closest("[lang]").prop("lang"))),null==this.options.dir&&(a.prop("dir")?this.options.dir=a.prop("dir"):a.closest("[dir]").prop("dir")?this.options.dir=a.closest("[dir]").prop("dir"):this.options.dir="ltr"),a.prop("disabled",this.options.disabled),a.prop("multiple",this.options.multiple),a.data("select2Tags")&&(this.options.debug&&window.console&&console.warn&&console.warn('Select2: The `data-select2-tags` attribute has been changed to use the `data-data` and `data-tags="true"` attributes and will be removed in future versions of Select2.'),a.data("data",a.data("select2Tags")),a.data("tags",!0)),a.data("ajaxUrl")&&(this.options.debug&&window.console&&console.warn&&console.warn("Select2: The `data-ajax-url` attribute has been changed to `data-ajax--url` and support for the old attribute will be removed in future versions of Select2."),a.attr("ajax--url",a.data("ajaxUrl")),a.data("ajax--url",a.data("ajaxUrl")));var e={};e=b.fn.jquery&&"1."==b.fn.jquery.substr(0,2)&&a[0].dataset?b.extend(!0,{},a[0].dataset,a.data()):a.data();var f=b.extend(!0,{},e);f=d._convertData(f);for(var g in f)b.inArray(g,c)>-1||(b.isPlainObject(this.options[g])?b.extend(this.options[g],f[g]):this.options[g]=f[g]);return this},e.prototype.get=function(a){return this.options[a]},e.prototype.set=function(a,b){this.options[a]=b},e}),b.define("select2/core",["jquery","./options","./utils","./keys"],function(a,b,c,d){var e=function(a,c){null!=a.data("select2")&&a.data("select2").destroy(),this.$element=a,this.id=this._generateId(a),c=c||{},this.options=new b(c,a),e.__super__.constructor.call(this);var d=a.attr("tabindex")||0;a.data("old-tabindex",d),a.attr("tabindex","-1");var f=this.options.get("dataAdapter");this.dataAdapter=new f(a,this.options);var g=this.render();this._placeContainer(g);var h=this.options.get("selectionAdapter");this.selection=new h(a,this.options),this.$selection=this.selection.render(),this.selection.position(this.$selection,g);var i=this.options.get("dropdownAdapter");this.dropdown=new i(a,this.options),this.$dropdown=this.dropdown.render(),this.dropdown.position(this.$dropdown,g);var j=this.options.get("resultsAdapter");this.results=new j(a,this.options,this.dataAdapter),this.$results=this.results.render(),this.results.position(this.$results,this.$dropdown);var k=this;this._bindAdapters(),this._registerDomEvents(),this._registerDataEvents(),this._registerSelectionEvents(),this._registerDropdownEvents(),this._registerResultsEvents(),this._registerEvents(),this.dataAdapter.current(function(a){k.trigger("selection:update",{data:a})}),a.addClass("select2-hidden-accessible"),a.attr("aria-hidden","true"),this._syncAttributes(),a.data("select2",this)};return c.Extend(e,c.Observable),e.prototype._generateId=function(a){var b="";return b=null!=a.attr("id")?a.attr("id"):null!=a.attr("name")?a.attr("name")+"-"+c.generateChars(2):c.generateChars(4),b=b.replace(/(:|\.|\[|\]|,)/g,""),b="select2-"+b},e.prototype._placeContainer=function(a){a.insertAfter(this.$element);var b=this._resolveWidth(this.$element,this.options.get("width"));null!=b&&a.css("width",b)},e.prototype._resolveWidth=function(a,b){var c=/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;if("resolve"==b){var d=this._resolveWidth(a,"style");return null!=d?d:this._resolveWidth(a,"element")}if("element"==b){var e=a.outerWidth(!1);return e<=0?"auto":e+"px"}if("style"==b){var f=a.attr("style");if("string"!=typeof f)return null;for(var g=f.split(";"),h=0,i=g.length;h<i;h+=1){var j=g[h].replace(/\s/g,""),k=j.match(c);if(null!==k&&k.length>=1)return k[1]}return null}return b},e.prototype._bindAdapters=function(){this.dataAdapter.bind(this,this.$container),this.selection.bind(this,this.$container),this.dropdown.bind(this,this.$container),this.results.bind(this,this.$container)},e.prototype._registerDomEvents=function(){var b=this;this.$element.on("change.select2",function(){b.dataAdapter.current(function(a){b.trigger("selection:update",{data:a})})}),this.$element.on("focus.select2",function(a){b.trigger("focus",a)}),this._syncA=c.bind(this._syncAttributes,this),this._syncS=c.bind(this._syncSubtree,this),this.$element[0].attachEvent&&this.$element[0].attachEvent("onpropertychange",this._syncA);var d=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver;null!=d?(this._observer=new d(function(c){a.each(c,b._syncA),a.each(c,b._syncS)}),this._observer.observe(this.$element[0],{attributes:!0,childList:!0,subtree:!1})):this.$element[0].addEventListener&&(this.$element[0].addEventListener("DOMAttrModified",b._syncA,!1),this.$element[0].addEventListener("DOMNodeInserted",b._syncS,!1),this.$element[0].addEventListener("DOMNodeRemoved",b._syncS,!1))},e.prototype._registerDataEvents=function(){var a=this;this.dataAdapter.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerSelectionEvents=function(){var b=this,c=["toggle","focus"];this.selection.on("toggle",function(){b.toggleDropdown()}),this.selection.on("focus",function(a){b.focus(a)}),this.selection.on("*",function(d,e){-1===a.inArray(d,c)&&b.trigger(d,e)})},e.prototype._registerDropdownEvents=function(){var a=this;this.dropdown.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerResultsEvents=function(){var a=this;this.results.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerEvents=function(){var a=this;this.on("open",function(){a.$container.addClass("select2-container--open")}),this.on("close",function(){a.$container.removeClass("select2-container--open")}),this.on("enable",function(){a.$container.removeClass("select2-container--disabled")}),this.on("disable",function(){a.$container.addClass("select2-container--disabled")}),this.on("blur",function(){a.$container.removeClass("select2-container--focus")}),this.on("query",function(b){a.isOpen()||a.trigger("open",{}),this.dataAdapter.query(b,function(c){a.trigger("results:all",{data:c,query:b})})}),this.on("query:append",function(b){this.dataAdapter.query(b,function(c){a.trigger("results:append",{data:c,query:b})})}),this.on("keypress",function(b){var c=b.which;a.isOpen()?c===d.ESC||c===d.TAB||c===d.UP&&b.altKey?(a.close(),b.preventDefault()):c===d.ENTER?(a.trigger("results:select",{}),b.preventDefault()):c===d.SPACE&&b.ctrlKey?(a.trigger("results:toggle",{}),b.preventDefault()):c===d.UP?(a.trigger("results:previous",{}),b.preventDefault()):c===d.DOWN&&(a.trigger("results:next",{}),b.preventDefault()):(c===d.ENTER||c===d.SPACE||c===d.DOWN&&b.altKey)&&(a.open(),b.preventDefault())})},e.prototype._syncAttributes=function(){this.options.set("disabled",this.$element.prop("disabled")),this.options.get("disabled")?(this.isOpen()&&this.close(),this.trigger("disable",{})):this.trigger("enable",{})},e.prototype._syncSubtree=function(a,b){var c=!1,d=this;if(!a||!a.target||"OPTION"===a.target.nodeName||"OPTGROUP"===a.target.nodeName){if(b)if(b.addedNodes&&b.addedNodes.length>0)for(var e=0;e<b.addedNodes.length;e++){var f=b.addedNodes[e];f.selected&&(c=!0)}else b.removedNodes&&b.removedNodes.length>0&&(c=!0);else c=!0;c&&this.dataAdapter.current(function(a){d.trigger("selection:update",{data:a})})}},e.prototype.trigger=function(a,b){var c=e.__super__.trigger,d={open:"opening",close:"closing",select:"selecting",unselect:"unselecting"};if(void 0===b&&(b={}),a in d){var f=d[a],g={prevented:!1,name:a,args:b};if(c.call(this,f,g),g.prevented)return void(b.prevented=!0)}c.call(this,a,b)},e.prototype.toggleDropdown=function(){this.options.get("disabled")||(this.isOpen()?this.close():this.open())},e.prototype.open=function(){this.isOpen()||this.trigger("query",{})},e.prototype.close=function(){this.isOpen()&&this.trigger("close",{})},e.prototype.isOpen=function(){return this.$container.hasClass("select2-container--open")},e.prototype.hasFocus=function(){return this.$container.hasClass("select2-container--focus")},e.prototype.focus=function(a){this.hasFocus()||(this.$container.addClass("select2-container--focus"),this.trigger("focus",{}))},e.prototype.enable=function(a){this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("enable")` method has been deprecated and will be removed in later Select2 versions. Use $element.prop("disabled") instead.'),null!=a&&0!==a.length||(a=[!0]);var b=!a[0];this.$element.prop("disabled",b)},e.prototype.data=function(){this.options.get("debug")&&arguments.length>0&&window.console&&console.warn&&console.warn('Select2: Data can no longer be set using `select2("data")`. You should consider setting the value instead using `$element.val()`.');var a=[];return this.dataAdapter.current(function(b){a=b}),a},e.prototype.val=function(b){if(this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("val")` method has been deprecated and will be removed in later Select2 versions. Use $element.val() instead.'),null==b||0===b.length)return this.$element.val();var c=b[0];a.isArray(c)&&(c=a.map(c,function(a){return a.toString()})),this.$element.val(c).trigger("change")},e.prototype.destroy=function(){this.$container.remove(),this.$element[0].detachEvent&&this.$element[0].detachEvent("onpropertychange",this._syncA),null!=this._observer?(this._observer.disconnect(),this._observer=null):this.$element[0].removeEventListener&&(this.$element[0].removeEventListener("DOMAttrModified",this._syncA,!1),this.$element[0].removeEventListener("DOMNodeInserted",this._syncS,!1),this.$element[0].removeEventListener("DOMNodeRemoved",this._syncS,!1)),this._syncA=null,this._syncS=null,this.$element.off(".select2"),this.$element.attr("tabindex",this.$element.data("old-tabindex")),this.$element.removeClass("select2-hidden-accessible"),this.$element.attr("aria-hidden","false"),this.$element.removeData("select2"),this.dataAdapter.destroy(),this.selection.destroy(),this.dropdown.destroy(),this.results.destroy(),this.dataAdapter=null,this.selection=null,this.dropdown=null,this.results=null},e.prototype.render=function(){var b=a('<span class="select2 select2-container"><span class="selection"></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>');return b.attr("dir",this.options.get("dir")),this.$container=b,this.$container.addClass("select2-container--"+this.options.get("theme")),b.data("element",this.$element),b},e}),b.define("jquery-mousewheel",["jquery"],function(a){return a}),b.define("jquery.select2",["jquery","jquery-mousewheel","./select2/core","./select2/defaults"],function(a,b,c,d){if(null==a.fn.select2){var e=["open","close","destroy"];a.fn.select2=function(b){if("object"==typeof(b=b||{}))return this.each(function(){var d=a.extend(!0,{},b);new c(a(this),d)}),this;if("string"==typeof b){var d,f=Array.prototype.slice.call(arguments,1);return this.each(function(){var c=a(this).data("select2");null==c&&window.console&&console.error&&console.error("The select2('"+b+"') method was called on an element that is not using Select2."),d=c[b].apply(c,f)}),a.inArray(b,e)>-1?this:d}throw new Error("Invalid arguments for Select2: "+b)}}return null==a.fn.select2.defaults&&(a.fn.select2.defaults=d),c}),{define:b.define,require:b.require}}(),c=b.require("jquery.select2");return a.fn.select2.amd=b,c});

/*
 * qTip2 - Pretty powerful tooltips - v3.0.3
 * http://qtip2.com
 *
 * Copyright (c) 2017
 * Released under the MIT licenses
 * http://jquery.org/license
 *
 * Date: Mon Aug 28 2017 05:13 EDT-0400
 * Plugins: viewport
 * Styles: core
 */
/*global window: false, jQuery: false, console: false, define: false */

/* Cache window, document, undefined */
(function( window, document, undefined ) {

// Uses AMD or browser globals to create a jQuery plugin.
(function( factory ) {
	"use strict";
	if(typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	}
	else if(jQuery && !jQuery.fn.qtip) {
		factory(jQuery);
	}
}
(function($) {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
;// Munge the primitives - Paul Irish tip
var TRUE = true,
FALSE = false,
NULL = null,

// Common variables
X = 'x', Y = 'y',
WIDTH = 'width',
HEIGHT = 'height',

// Positioning sides
TOP = 'top',
LEFT = 'left',
BOTTOM = 'bottom',
RIGHT = 'right',
CENTER = 'center',

// Position adjustment types
FLIP = 'flip',
FLIPINVERT = 'flipinvert',
SHIFT = 'shift',

// Shortcut vars
QTIP, PROTOTYPE, CORNER, CHECKS,
PLUGINS = {},
NAMESPACE = 'qtip',
ATTR_HAS = 'data-hasqtip',
ATTR_ID = 'data-qtip-id',
WIDGET = ['ui-widget', 'ui-tooltip'],
SELECTOR = '.'+NAMESPACE,
INACTIVE_EVENTS = 'click dblclick mousedown mouseup mousemove mouseleave mouseenter'.split(' '),

CLASS_FIXED = NAMESPACE+'-fixed',
CLASS_DEFAULT = NAMESPACE + '-default',
CLASS_FOCUS = NAMESPACE + '-focus',
CLASS_HOVER = NAMESPACE + '-hover',
CLASS_DISABLED = NAMESPACE+'-disabled',

replaceSuffix = '_replacedByqTip',
oldtitle = 'oldtitle',
trackingBound,

// Browser detection
BROWSER = {
	/*
	 * IE version detection
	 *
	 * Adapted from: http://ajaxian.com/archives/attack-of-the-ie-conditional-comment
	 * Credit to James Padolsey for the original implemntation!
	 */
	ie: (function() {
		/* eslint-disable no-empty */
		var v, i;
		for (
			v = 4, i = document.createElement('div');
			(i.innerHTML = '<!--[if gt IE ' + v + ']><i></i><![endif]-->') && i.getElementsByTagName('i')[0];
			v+=1
		) {}
		return v > 4 ? v : NaN;
		/* eslint-enable no-empty */
	})(),

	/*
	 * iOS version detection
	 */
	iOS: parseFloat(
		('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
		.replace('undefined', '3_2').replace('_', '.').replace('_', '')
	) || FALSE
};
;function QTip(target, options, id, attr) {
	// Elements and ID
	this.id = id;
	this.target = target;
	this.tooltip = NULL;
	this.elements = { target: target };

	// Internal constructs
	this._id = NAMESPACE + '-' + id;
	this.timers = { img: {} };
	this.options = options;
	this.plugins = {};

	// Cache object
	this.cache = {
		event: {},
		target: $(),
		disabled: FALSE,
		attr: attr,
		onTooltip: FALSE,
		lastClass: ''
	};

	// Set the initial flags
	this.rendered = this.destroyed = this.disabled = this.waiting =
		this.hiddenDuringWait = this.positioning = this.triggering = FALSE;
}
PROTOTYPE = QTip.prototype;

PROTOTYPE._when = function(deferreds) {
	return $.when.apply($, deferreds);
};

PROTOTYPE.render = function(show) {
	if(this.rendered || this.destroyed) { return this; } // If tooltip has already been rendered, exit

	var self = this,
		options = this.options,
		cache = this.cache,
		elements = this.elements,
		text = options.content.text,
		title = options.content.title,
		button = options.content.button,
		posOptions = options.position,
		deferreds = [];

	// Add ARIA attributes to target
	$.attr(this.target[0], 'aria-describedby', this._id);

	// Create public position object that tracks current position corners
	cache.posClass = this._createPosClass(
		(this.position = { my: posOptions.my, at: posOptions.at }).my
	);

	// Create tooltip element
	this.tooltip = elements.tooltip = $('<div/>', {
		'id': this._id,
		'class': [ NAMESPACE, CLASS_DEFAULT, options.style.classes, cache.posClass ].join(' '),
		'width': options.style.width || '',
		'height': options.style.height || '',
		'tracking': posOptions.target === 'mouse' && posOptions.adjust.mouse,

		/* ARIA specific attributes */
		'role': 'alert',
		'aria-live': 'polite',
		'aria-atomic': FALSE,
		'aria-describedby': this._id + '-content',
		'aria-hidden': TRUE
	})
	.toggleClass(CLASS_DISABLED, this.disabled)
	.attr(ATTR_ID, this.id)
	.data(NAMESPACE, this)
	.appendTo(posOptions.container)
	.append(
		// Create content element
		elements.content = $('<div />', {
			'class': NAMESPACE + '-content',
			'id': this._id + '-content',
			'aria-atomic': TRUE
		})
	);

	// Set rendered flag and prevent redundant reposition calls for now
	this.rendered = -1;
	this.positioning = TRUE;

	// Create title...
	if(title) {
		this._createTitle();

		// Update title only if its not a callback (called in toggle if so)
		if(!$.isFunction(title)) {
			deferreds.push( this._updateTitle(title, FALSE) );
		}
	}

	// Create button
	if(button) { this._createButton(); }

	// Set proper rendered flag and update content if not a callback function (called in toggle)
	if(!$.isFunction(text)) {
		deferreds.push( this._updateContent(text, FALSE) );
	}
	this.rendered = TRUE;

	// Setup widget classes
	this._setWidget();

	// Initialize 'render' plugins
	$.each(PLUGINS, function(name) {
		var instance;
		if(this.initialize === 'render' && (instance = this(self))) {
			self.plugins[name] = instance;
		}
	});

	// Unassign initial events and assign proper events
	this._unassignEvents();
	this._assignEvents();

	// When deferreds have completed
	this._when(deferreds).then(function() {
		// tooltiprender event
		self._trigger('render');

		// Reset flags
		self.positioning = FALSE;

		// Show tooltip if not hidden during wait period
		if(!self.hiddenDuringWait && (options.show.ready || show)) {
			self.toggle(TRUE, cache.event, FALSE);
		}
		self.hiddenDuringWait = FALSE;
	});

	// Expose API
	QTIP.api[this.id] = this;

	return this;
};

PROTOTYPE.destroy = function(immediate) {
	// Set flag the signify destroy is taking place to plugins
	// and ensure it only gets destroyed once!
	if(this.destroyed) { return this.target; }

	function process() {
		if(this.destroyed) { return; }
		this.destroyed = TRUE;

		var target = this.target,
			title = target.attr(oldtitle),
			timer;

		// Destroy tooltip if rendered
		if(this.rendered) {
			this.tooltip.stop(1,0).find('*').remove().end().remove();
		}

		// Destroy all plugins
		$.each(this.plugins, function() {
			this.destroy && this.destroy();
		});

		// Clear timers
		for (timer in this.timers) {
			if (this.timers.hasOwnProperty(timer)) {
				clearTimeout(this.timers[timer]);
			}
		}

		// Remove api object and ARIA attributes
		target.removeData(NAMESPACE)
			.removeAttr(ATTR_ID)
			.removeAttr(ATTR_HAS)
			.removeAttr('aria-describedby');

		// Reset old title attribute if removed
		if(this.options.suppress && title) {
			target.attr('title', title).removeAttr(oldtitle);
		}

		// Remove qTip events associated with this API
		this._unassignEvents();

		// Remove ID from used id objects, and delete object references
		// for better garbage collection and leak protection
		this.options = this.elements = this.cache = this.timers =
			this.plugins = this.mouse = NULL;

		// Delete epoxsed API object
		delete QTIP.api[this.id];
	}

	// If an immediate destroy is needed
	if((immediate !== TRUE || this.triggering === 'hide') && this.rendered) {
		this.tooltip.one('tooltiphidden', $.proxy(process, this));
		!this.triggering && this.hide();
	}

	// If we're not in the process of hiding... process
	else { process.call(this); }

	return this.target;
};
;function invalidOpt(a) {
	return a === NULL || $.type(a) !== 'object';
}

function invalidContent(c) {
	return !($.isFunction(c) ||
            c && c.attr ||
            c.length ||
            $.type(c) === 'object' && (c.jquery || c.then));
}

// Option object sanitizer
function sanitizeOptions(opts) {
	var content, text, ajax, once;

	if(invalidOpt(opts)) { return FALSE; }

	if(invalidOpt(opts.metadata)) {
		opts.metadata = { type: opts.metadata };
	}

	if('content' in opts) {
		content = opts.content;

		if(invalidOpt(content) || content.jquery || content.done) {
			text = invalidContent(content) ? FALSE : content;
			content = opts.content = {
				text: text
			};
		}
		else { text = content.text; }

		// DEPRECATED - Old content.ajax plugin functionality
		// Converts it into the proper Deferred syntax
		if('ajax' in content) {
			ajax = content.ajax;
			once = ajax && ajax.once !== FALSE;
			delete content.ajax;

			content.text = function(event, api) {
				var loading = text || $(this).attr(api.options.content.attr) || 'Loading...',

				deferred = $.ajax(
					$.extend({}, ajax, { context: api })
				)
				.then(ajax.success, NULL, ajax.error)
				.then(function(newContent) {
					if(newContent && once) { api.set('content.text', newContent); }
					return newContent;
				},
				function(xhr, status, error) {
					if(api.destroyed || xhr.status === 0) { return; }
					api.set('content.text', status + ': ' + error);
				});

				return !once ? (api.set('content.text', loading), deferred) : loading;
			};
		}

		if('title' in content) {
			if($.isPlainObject(content.title)) {
				content.button = content.title.button;
				content.title = content.title.text;
			}

			if(invalidContent(content.title || FALSE)) {
				content.title = FALSE;
			}
		}
	}

	if('position' in opts && invalidOpt(opts.position)) {
		opts.position = { my: opts.position, at: opts.position };
	}

	if('show' in opts && invalidOpt(opts.show)) {
		opts.show = opts.show.jquery ? { target: opts.show } :
			opts.show === TRUE ? { ready: TRUE } : { event: opts.show };
	}

	if('hide' in opts && invalidOpt(opts.hide)) {
		opts.hide = opts.hide.jquery ? { target: opts.hide } : { event: opts.hide };
	}

	if('style' in opts && invalidOpt(opts.style)) {
		opts.style = { classes: opts.style };
	}

	// Sanitize plugin options
	$.each(PLUGINS, function() {
		this.sanitize && this.sanitize(opts);
	});

	return opts;
}

// Setup builtin .set() option checks
CHECKS = PROTOTYPE.checks = {
	builtin: {
		// Core checks
		'^id$': function(obj, o, v, prev) {
			var id = v === TRUE ? QTIP.nextid : v,
				newId = NAMESPACE + '-' + id;

			if(id !== FALSE && id.length > 0 && !$('#'+newId).length) {
				this._id = newId;

				if(this.rendered) {
					this.tooltip[0].id = this._id;
					this.elements.content[0].id = this._id + '-content';
					this.elements.title[0].id = this._id + '-title';
				}
			}
			else { obj[o] = prev; }
		},
		'^prerender': function(obj, o, v) {
			v && !this.rendered && this.render(this.options.show.ready);
		},

		// Content checks
		'^content.text$': function(obj, o, v) {
			this._updateContent(v);
		},
		'^content.attr$': function(obj, o, v, prev) {
			if(this.options.content.text === this.target.attr(prev)) {
				this._updateContent( this.target.attr(v) );
			}
		},
		'^content.title$': function(obj, o, v) {
			// Remove title if content is null
			if(!v) { return this._removeTitle(); }

			// If title isn't already created, create it now and update
			v && !this.elements.title && this._createTitle();
			this._updateTitle(v);
		},
		'^content.button$': function(obj, o, v) {
			this._updateButton(v);
		},
		'^content.title.(text|button)$': function(obj, o, v) {
			this.set('content.'+o, v); // Backwards title.text/button compat
		},

		// Position checks
		'^position.(my|at)$': function(obj, o, v){
			if('string' === typeof v) {
				this.position[o] = obj[o] = new CORNER(v, o === 'at');
			}
		},
		'^position.container$': function(obj, o, v){
			this.rendered && this.tooltip.appendTo(v);
		},

		// Show checks
		'^show.ready$': function(obj, o, v) {
			v && (!this.rendered && this.render(TRUE) || this.toggle(TRUE));
		},

		// Style checks
		'^style.classes$': function(obj, o, v, p) {
			this.rendered && this.tooltip.removeClass(p).addClass(v);
		},
		'^style.(width|height)': function(obj, o, v) {
			this.rendered && this.tooltip.css(o, v);
		},
		'^style.widget|content.title': function() {
			this.rendered && this._setWidget();
		},
		'^style.def': function(obj, o, v) {
			this.rendered && this.tooltip.toggleClass(CLASS_DEFAULT, !!v);
		},

		// Events check
		'^events.(render|show|move|hide|focus|blur)$': function(obj, o, v) {
			this.rendered && this.tooltip[($.isFunction(v) ? '' : 'un') + 'bind']('tooltip'+o, v);
		},

		// Properties which require event reassignment
		'^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)': function() {
			if(!this.rendered) { return; }

			// Set tracking flag
			var posOptions = this.options.position;
			this.tooltip.attr('tracking', posOptions.target === 'mouse' && posOptions.adjust.mouse);

			// Reassign events
			this._unassignEvents();
			this._assignEvents();
		}
	}
};

// Dot notation converter
function convertNotation(options, notation) {
	var i = 0, obj, option = options,

	// Split notation into array
	levels = notation.split('.');

	// Loop through
	while(option = option[ levels[i++] ]) {
		if(i < levels.length) { obj = option; }
	}

	return [obj || options, levels.pop()];
}

PROTOTYPE.get = function(notation) {
	if(this.destroyed) { return this; }

	var o = convertNotation(this.options, notation.toLowerCase()),
		result = o[0][ o[1] ];

	return result.precedance ? result.string() : result;
};

function setCallback(notation, args) {
	var category, rule, match;

	for(category in this.checks) {
		if (!this.checks.hasOwnProperty(category)) { continue; }

		for(rule in this.checks[category]) {
			if (!this.checks[category].hasOwnProperty(rule)) { continue; }

			if(match = (new RegExp(rule, 'i')).exec(notation)) {
				args.push(match);

				if(category === 'builtin' || this.plugins[category]) {
					this.checks[category][rule].apply(
						this.plugins[category] || this, args
					);
				}
			}
		}
	}
}

var rmove = /^position\.(my|at|adjust|target|container|viewport)|style|content|show\.ready/i,
	rrender = /^prerender|show\.ready/i;

PROTOTYPE.set = function(option, value) {
	if(this.destroyed) { return this; }

	var rendered = this.rendered,
		reposition = FALSE,
		options = this.options,
		name;

	// Convert singular option/value pair into object form
	if('string' === typeof option) {
		name = option; option = {}; option[name] = value;
	}
	else { option = $.extend({}, option); }

	// Set all of the defined options to their new values
	$.each(option, function(notation, val) {
		if(rendered && rrender.test(notation)) {
			delete option[notation]; return;
		}

		// Set new obj value
		var obj = convertNotation(options, notation.toLowerCase()), previous;
		previous = obj[0][ obj[1] ];
		obj[0][ obj[1] ] = val && val.nodeType ? $(val) : val;

		// Also check if we need to reposition
		reposition = rmove.test(notation) || reposition;

		// Set the new params for the callback
		option[notation] = [obj[0], obj[1], val, previous];
	});

	// Re-sanitize options
	sanitizeOptions(options);

	/*
	 * Execute any valid callbacks for the set options
	 * Also set positioning flag so we don't get loads of redundant repositioning calls.
	 */
	this.positioning = TRUE;
	$.each(option, $.proxy(setCallback, this));
	this.positioning = FALSE;

	// Update position if needed
	if(this.rendered && this.tooltip[0].offsetWidth > 0 && reposition) {
		this.reposition( options.position.target === 'mouse' ? NULL : this.cache.event );
	}

	return this;
};
;PROTOTYPE._update = function(content, element) {
	var self = this,
		cache = this.cache;

	// Make sure tooltip is rendered and content is defined. If not return
	if(!this.rendered || !content) { return FALSE; }

	// Use function to parse content
	if($.isFunction(content)) {
		content = content.call(this.elements.target, cache.event, this) || '';
	}

	// Handle deferred content
	if($.isFunction(content.then)) {
		cache.waiting = TRUE;
		return content.then(function(c) {
			cache.waiting = FALSE;
			return self._update(c, element);
		}, NULL, function(e) {
			return self._update(e, element);
		});
	}

	// If content is null... return false
	if(content === FALSE || !content && content !== '') { return FALSE; }

	// Append new content if its a DOM array and show it if hidden
	if(content.jquery && content.length > 0) {
		element.empty().append(
			content.css({ display: 'block', visibility: 'visible' })
		);
	}

	// Content is a regular string, insert the new content
	else { element.html(content); }

	// Wait for content to be loaded, and reposition
	return this._waitForContent(element).then(function(images) {
		if(self.rendered && self.tooltip[0].offsetWidth > 0) {
			self.reposition(cache.event, !images.length);
		}
	});
};

PROTOTYPE._waitForContent = function(element) {
	var cache = this.cache;

	// Set flag
	cache.waiting = TRUE;

	// If imagesLoaded is included, ensure images have loaded and return promise
	return ( $.fn.imagesLoaded ? element.imagesLoaded() : new $.Deferred().resolve([]) )
		.done(function() { cache.waiting = FALSE; })
		.promise();
};

PROTOTYPE._updateContent = function(content, reposition) {
	this._update(content, this.elements.content, reposition);
};

PROTOTYPE._updateTitle = function(content, reposition) {
	if(this._update(content, this.elements.title, reposition) === FALSE) {
		this._removeTitle(FALSE);
	}
};

PROTOTYPE._createTitle = function()
{
	var elements = this.elements,
		id = this._id+'-title';

	// Destroy previous title element, if present
	if(elements.titlebar) { this._removeTitle(); }

	// Create title bar and title elements
	elements.titlebar = $('<div />', {
		'class': NAMESPACE + '-titlebar ' + (this.options.style.widget ? createWidgetClass('header') : '')
	})
	.append(
		elements.title = $('<div />', {
			'id': id,
			'class': NAMESPACE + '-title',
			'aria-atomic': TRUE
		})
	)
	.insertBefore(elements.content)

	// Button-specific events
	.delegate('.qtip-close', 'mousedown keydown mouseup keyup mouseout', function(event) {
		$(this).toggleClass('ui-state-active ui-state-focus', event.type.substr(-4) === 'down');
	})
	.delegate('.qtip-close', 'mouseover mouseout', function(event){
		$(this).toggleClass('ui-state-hover', event.type === 'mouseover');
	});

	// Create button if enabled
	if(this.options.content.button) { this._createButton(); }
};

PROTOTYPE._removeTitle = function(reposition)
{
	var elements = this.elements;

	if(elements.title) {
		elements.titlebar.remove();
		elements.titlebar = elements.title = elements.button = NULL;

		// Reposition if enabled
		if(reposition !== FALSE) { this.reposition(); }
	}
};
;PROTOTYPE._createPosClass = function(my) {
	return NAMESPACE + '-pos-' + (my || this.options.position.my).abbrev();
};

PROTOTYPE.reposition = function(event, effect) {
	if(!this.rendered || this.positioning || this.destroyed) { return this; }

	// Set positioning flag
	this.positioning = TRUE;

	var cache = this.cache,
		tooltip = this.tooltip,
		posOptions = this.options.position,
		target = posOptions.target,
		my = posOptions.my,
		at = posOptions.at,
		viewport = posOptions.viewport,
		container = posOptions.container,
		adjust = posOptions.adjust,
		method = adjust.method.split(' '),
		tooltipWidth = tooltip.outerWidth(FALSE),
		tooltipHeight = tooltip.outerHeight(FALSE),
		targetWidth = 0,
		targetHeight = 0,
		type = tooltip.css('position'),
		position = { left: 0, top: 0 },
		visible = tooltip[0].offsetWidth > 0,
		isScroll = event && event.type === 'scroll',
		win = $(window),
		doc = container[0].ownerDocument,
		mouse = this.mouse,
		pluginCalculations, offset, adjusted, newClass;

	// Check if absolute position was passed
	if($.isArray(target) && target.length === 2) {
		// Force left top and set position
		at = { x: LEFT, y: TOP };
		position = { left: target[0], top: target[1] };
	}

	// Check if mouse was the target
	else if(target === 'mouse') {
		// Force left top to allow flipping
		at = { x: LEFT, y: TOP };

		// Use the mouse origin that caused the show event, if distance hiding is enabled
		if((!adjust.mouse || this.options.hide.distance) && cache.origin && cache.origin.pageX) {
			event =  cache.origin;
		}

		// Use cached event for resize/scroll events
		else if(!event || event && (event.type === 'resize' || event.type === 'scroll')) {
			event = cache.event;
		}

		// Otherwise, use the cached mouse coordinates if available
		else if(mouse && mouse.pageX) {
			event = mouse;
		}

		// Calculate body and container offset and take them into account below
		if(type !== 'static') { position = container.offset(); }
		if(doc.body.offsetWidth !== (window.innerWidth || doc.documentElement.clientWidth)) {
			offset = $(document.body).offset();
		}

		// Use event coordinates for position
		position = {
			left: event.pageX - position.left + (offset && offset.left || 0),
			top: event.pageY - position.top + (offset && offset.top || 0)
		};

		// Scroll events are a pain, some browsers
		if(adjust.mouse && isScroll && mouse) {
			position.left -= (mouse.scrollX || 0) - win.scrollLeft();
			position.top -= (mouse.scrollY || 0) - win.scrollTop();
		}
	}

	// Target wasn't mouse or absolute...
	else {
		// Check if event targetting is being used
		if(target === 'event') {
			if(event && event.target && event.type !== 'scroll' && event.type !== 'resize') {
				cache.target = $(event.target);
			}
			else if(!event.target) {
				cache.target = this.elements.target;
			}
		}
		else if(target !== 'event'){
			cache.target = $(target.jquery ? target : this.elements.target);
		}
		target = cache.target;

		// Parse the target into a jQuery object and make sure there's an element present
		target = $(target).eq(0);
		if(target.length === 0) { return this; }

		// Check if window or document is the target
		else if(target[0] === document || target[0] === window) {
			targetWidth = BROWSER.iOS ? window.innerWidth : target.width();
			targetHeight = BROWSER.iOS ? window.innerHeight : target.height();

			if(target[0] === window) {
				position = {
					top: (viewport || target).scrollTop(),
					left: (viewport || target).scrollLeft()
				};
			}
		}

		// Check if the target is an <AREA> element
		else if(PLUGINS.imagemap && target.is('area')) {
			pluginCalculations = PLUGINS.imagemap(this, target, at, PLUGINS.viewport ? method : FALSE);
		}

		// Check if the target is an SVG element
		else if(PLUGINS.svg && target && target[0].ownerSVGElement) {
			pluginCalculations = PLUGINS.svg(this, target, at, PLUGINS.viewport ? method : FALSE);
		}

		// Otherwise use regular jQuery methods
		else {
			targetWidth = target.outerWidth(FALSE);
			targetHeight = target.outerHeight(FALSE);
			position = target.offset();
		}

		// Parse returned plugin values into proper variables
		if(pluginCalculations) {
			targetWidth = pluginCalculations.width;
			targetHeight = pluginCalculations.height;
			offset = pluginCalculations.offset;
			position = pluginCalculations.position;
		}

		// Adjust position to take into account offset parents
		position = this.reposition.offset(target, position, container);

		// Adjust for position.fixed tooltips (and also iOS scroll bug in v3.2-4.0 & v4.3-4.3.2)
		if(BROWSER.iOS > 3.1 && BROWSER.iOS < 4.1 ||
			BROWSER.iOS >= 4.3 && BROWSER.iOS < 4.33 ||
			!BROWSER.iOS && type === 'fixed'
		){
			position.left -= win.scrollLeft();
			position.top -= win.scrollTop();
		}

		// Adjust position relative to target
		if(!pluginCalculations || pluginCalculations && pluginCalculations.adjustable !== FALSE) {
			position.left += at.x === RIGHT ? targetWidth : at.x === CENTER ? targetWidth / 2 : 0;
			position.top += at.y === BOTTOM ? targetHeight : at.y === CENTER ? targetHeight / 2 : 0;
		}
	}

	// Adjust position relative to tooltip
	position.left += adjust.x + (my.x === RIGHT ? -tooltipWidth : my.x === CENTER ? -tooltipWidth / 2 : 0);
	position.top += adjust.y + (my.y === BOTTOM ? -tooltipHeight : my.y === CENTER ? -tooltipHeight / 2 : 0);

	// Use viewport adjustment plugin if enabled
	if(PLUGINS.viewport) {
		adjusted = position.adjusted = PLUGINS.viewport(
			this, position, posOptions, targetWidth, targetHeight, tooltipWidth, tooltipHeight
		);

		// Apply offsets supplied by positioning plugin (if used)
		if(offset && adjusted.left) { position.left += offset.left; }
		if(offset && adjusted.top) {  position.top += offset.top; }

		// Apply any new 'my' position
		if(adjusted.my) { this.position.my = adjusted.my; }
	}

	// Viewport adjustment is disabled, set values to zero
	else { position.adjusted = { left: 0, top: 0 }; }

	// Set tooltip position class if it's changed
	if(cache.posClass !== (newClass = this._createPosClass(this.position.my))) {
		cache.posClass = newClass;
		tooltip.removeClass(cache.posClass).addClass(newClass);
	}

	// tooltipmove event
	if(!this._trigger('move', [position, viewport.elem || viewport], event)) { return this; }
	delete position.adjusted;

	// If effect is disabled, target it mouse, no animation is defined or positioning gives NaN out, set CSS directly
	if(effect === FALSE || !visible || isNaN(position.left) || isNaN(position.top) || target === 'mouse' || !$.isFunction(posOptions.effect)) {
		tooltip.css(position);
	}

	// Use custom function if provided
	else if($.isFunction(posOptions.effect)) {
		posOptions.effect.call(tooltip, this, $.extend({}, position));
		tooltip.queue(function(next) {
			// Reset attributes to avoid cross-browser rendering bugs
			$(this).css({ opacity: '', height: '' });
			if(BROWSER.ie) { this.style.removeAttribute('filter'); }

			next();
		});
	}

	// Set positioning flag
	this.positioning = FALSE;

	return this;
};

// Custom (more correct for qTip!) offset calculator
PROTOTYPE.reposition.offset = function(elem, pos, container) {
	if(!container[0]) { return pos; }

	var ownerDocument = $(elem[0].ownerDocument),
		quirks = !!BROWSER.ie && document.compatMode !== 'CSS1Compat',
		parent = container[0],
		scrolled, position, parentOffset, overflow;

	function scroll(e, i) {
		pos.left += i * e.scrollLeft();
		pos.top += i * e.scrollTop();
	}

	// Compensate for non-static containers offset
	do {
		if((position = $.css(parent, 'position')) !== 'static') {
			if(position === 'fixed') {
				parentOffset = parent.getBoundingClientRect();
				scroll(ownerDocument, -1);
			}
			else {
				parentOffset = $(parent).position();
				parentOffset.left += parseFloat($.css(parent, 'borderLeftWidth')) || 0;
				parentOffset.top += parseFloat($.css(parent, 'borderTopWidth')) || 0;
			}

			pos.left -= parentOffset.left + (parseFloat($.css(parent, 'marginLeft')) || 0);
			pos.top -= parentOffset.top + (parseFloat($.css(parent, 'marginTop')) || 0);

			// If this is the first parent element with an overflow of "scroll" or "auto", store it
			if(!scrolled && (overflow = $.css(parent, 'overflow')) !== 'hidden' && overflow !== 'visible') { scrolled = $(parent); }
		}
	}
	while(parent = parent.offsetParent);

	// Compensate for containers scroll if it also has an offsetParent (or in IE quirks mode)
	if(scrolled && (scrolled[0] !== ownerDocument[0] || quirks)) {
		scroll(scrolled, 1);
	}

	return pos;
};

// Corner class
var C = (CORNER = PROTOTYPE.reposition.Corner = function(corner, forceY) {
	corner = ('' + corner).replace(/([A-Z])/, ' $1').replace(/middle/gi, CENTER).toLowerCase();
	this.x = (corner.match(/left|right/i) || corner.match(/center/) || ['inherit'])[0].toLowerCase();
	this.y = (corner.match(/top|bottom|center/i) || ['inherit'])[0].toLowerCase();
	this.forceY = !!forceY;

	var f = corner.charAt(0);
	this.precedance = f === 't' || f === 'b' ? Y : X;
}).prototype;

C.invert = function(z, center) {
	this[z] = this[z] === LEFT ? RIGHT : this[z] === RIGHT ? LEFT : center || this[z];
};

C.string = function(join) {
	var x = this.x, y = this.y;

	var result = x !== y ?
		x === 'center' || y !== 'center' && (this.precedance === Y || this.forceY) ?
			[y,x] :
			[x,y] :
		[x];

	return join !== false ? result.join(' ') : result;
};

C.abbrev = function() {
	var result = this.string(false);
	return result[0].charAt(0) + (result[1] && result[1].charAt(0) || '');
};

C.clone = function() {
	return new CORNER( this.string(), this.forceY );
};

;
PROTOTYPE.toggle = function(state, event) {
	var cache = this.cache,
		options = this.options,
		tooltip = this.tooltip;

	// Try to prevent flickering when tooltip overlaps show element
	if(event) {
		if((/over|enter/).test(event.type) && cache.event && (/out|leave/).test(cache.event.type) &&
			options.show.target.add(event.target).length === options.show.target.length &&
			tooltip.has(event.relatedTarget).length) {
			return this;
		}

		// Cache event
		cache.event = $.event.fix(event);
	}

	// If we're currently waiting and we've just hidden... stop it
	this.waiting && !state && (this.hiddenDuringWait = TRUE);

	// Render the tooltip if showing and it isn't already
	if(!this.rendered) { return state ? this.render(1) : this; }
	else if(this.destroyed || this.disabled) { return this; }

	var type = state ? 'show' : 'hide',
		opts = this.options[type],
		posOptions = this.options.position,
		contentOptions = this.options.content,
		width = this.tooltip.css('width'),
		visible = this.tooltip.is(':visible'),
		animate = state || opts.target.length === 1,
		sameTarget = !event || opts.target.length < 2 || cache.target[0] === event.target,
		identicalState, allow, after;

	// Detect state if valid one isn't provided
	if((typeof state).search('boolean|number')) { state = !visible; }

	// Check if the tooltip is in an identical state to the new would-be state
	identicalState = !tooltip.is(':animated') && visible === state && sameTarget;

	// Fire tooltip(show/hide) event and check if destroyed
	allow = !identicalState ? !!this._trigger(type, [90]) : NULL;

	// Check to make sure the tooltip wasn't destroyed in the callback
	if(this.destroyed) { return this; }

	// If the user didn't stop the method prematurely and we're showing the tooltip, focus it
	if(allow !== FALSE && state) { this.focus(event); }

	// If the state hasn't changed or the user stopped it, return early
	if(!allow || identicalState) { return this; }

	// Set ARIA hidden attribute
	$.attr(tooltip[0], 'aria-hidden', !!!state);

	// Execute state specific properties
	if(state) {
		// Store show origin coordinates
		this.mouse && (cache.origin = $.event.fix(this.mouse));

		// Update tooltip content & title if it's a dynamic function
		if($.isFunction(contentOptions.text)) { this._updateContent(contentOptions.text, FALSE); }
		if($.isFunction(contentOptions.title)) { this._updateTitle(contentOptions.title, FALSE); }

		// Cache mousemove events for positioning purposes (if not already tracking)
		if(!trackingBound && posOptions.target === 'mouse' && posOptions.adjust.mouse) {
			$(document).bind('mousemove.'+NAMESPACE, this._storeMouse);
			trackingBound = TRUE;
		}

		// Update the tooltip position (set width first to prevent viewport/max-width issues)
		if(!width) { tooltip.css('width', tooltip.outerWidth(FALSE)); }
		this.reposition(event, arguments[2]);
		if(!width) { tooltip.css('width', ''); }

		// Hide other tooltips if tooltip is solo
		if(!!opts.solo) {
			(typeof opts.solo === 'string' ? $(opts.solo) : $(SELECTOR, opts.solo))
				.not(tooltip).not(opts.target).qtip('hide', new $.Event('tooltipsolo'));
		}
	}
	else {
		// Clear show timer if we're hiding
		clearTimeout(this.timers.show);

		// Remove cached origin on hide
		delete cache.origin;

		// Remove mouse tracking event if not needed (all tracking qTips are hidden)
		if(trackingBound && !$(SELECTOR+'[tracking="true"]:visible', opts.solo).not(tooltip).length) {
			$(document).unbind('mousemove.'+NAMESPACE);
			trackingBound = FALSE;
		}

		// Blur the tooltip
		this.blur(event);
	}

	// Define post-animation, state specific properties
	after = $.proxy(function() {
		if(state) {
			// Prevent antialias from disappearing in IE by removing filter
			if(BROWSER.ie) { tooltip[0].style.removeAttribute('filter'); }

			// Remove overflow setting to prevent tip bugs
			tooltip.css('overflow', '');

			// Autofocus elements if enabled
			if('string' === typeof opts.autofocus) {
				$(this.options.show.autofocus, tooltip).focus();
			}

			// If set, hide tooltip when inactive for delay period
			this.options.show.target.trigger('qtip-'+this.id+'-inactive');
		}
		else {
			// Reset CSS states
			tooltip.css({
				display: '',
				visibility: '',
				opacity: '',
				left: '',
				top: ''
			});
		}

		// tooltipvisible/tooltiphidden events
		this._trigger(state ? 'visible' : 'hidden');
	}, this);

	// If no effect type is supplied, use a simple toggle
	if(opts.effect === FALSE || animate === FALSE) {
		tooltip[ type ]();
		after();
	}

	// Use custom function if provided
	else if($.isFunction(opts.effect)) {
		tooltip.stop(1, 1);
		opts.effect.call(tooltip, this);
		tooltip.queue('fx', function(n) {
			after(); n();
		});
	}

	// Use basic fade function by default
	else { tooltip.fadeTo(90, state ? 1 : 0, after); }

	// If inactive hide method is set, active it
	if(state) { opts.target.trigger('qtip-'+this.id+'-inactive'); }

	return this;
};

PROTOTYPE.show = function(event) { return this.toggle(TRUE, event); };

PROTOTYPE.hide = function(event) { return this.toggle(FALSE, event); };
;PROTOTYPE.focus = function(event) {
	if(!this.rendered || this.destroyed) { return this; }

	var qtips = $(SELECTOR),
		tooltip = this.tooltip,
		curIndex = parseInt(tooltip[0].style.zIndex, 10),
		newIndex = QTIP.zindex + qtips.length;

	// Only update the z-index if it has changed and tooltip is not already focused
	if(!tooltip.hasClass(CLASS_FOCUS)) {
		// tooltipfocus event
		if(this._trigger('focus', [newIndex], event)) {
			// Only update z-index's if they've changed
			if(curIndex !== newIndex) {
				// Reduce our z-index's and keep them properly ordered
				qtips.each(function() {
					if(this.style.zIndex > curIndex) {
						this.style.zIndex = this.style.zIndex - 1;
					}
				});

				// Fire blur event for focused tooltip
				qtips.filter('.' + CLASS_FOCUS).qtip('blur', event);
			}

			// Set the new z-index
			tooltip.addClass(CLASS_FOCUS)[0].style.zIndex = newIndex;
		}
	}

	return this;
};

PROTOTYPE.blur = function(event) {
	if(!this.rendered || this.destroyed) { return this; }

	// Set focused status to FALSE
	this.tooltip.removeClass(CLASS_FOCUS);

	// tooltipblur event
	this._trigger('blur', [ this.tooltip.css('zIndex') ], event);

	return this;
};
;PROTOTYPE.disable = function(state) {
	if(this.destroyed) { return this; }

	// If 'toggle' is passed, toggle the current state
	if(state === 'toggle') {
		state = !(this.rendered ? this.tooltip.hasClass(CLASS_DISABLED) : this.disabled);
	}

	// Disable if no state passed
	else if('boolean' !== typeof state) {
		state = TRUE;
	}

	if(this.rendered) {
		this.tooltip.toggleClass(CLASS_DISABLED, state)
			.attr('aria-disabled', state);
	}

	this.disabled = !!state;

	return this;
};

PROTOTYPE.enable = function() { return this.disable(FALSE); };
;PROTOTYPE._createButton = function()
{
	var self = this,
		elements = this.elements,
		tooltip = elements.tooltip,
		button = this.options.content.button,
		isString = typeof button === 'string',
		close = isString ? button : 'Close tooltip';

	if(elements.button) { elements.button.remove(); }

	// Use custom button if one was supplied by user, else use default
	if(button.jquery) {
		elements.button = button;
	}
	else {
		elements.button = $('<a />', {
			'class': 'qtip-close ' + (this.options.style.widget ? '' : NAMESPACE+'-icon'),
			'title': close,
			'aria-label': close
		})
		.prepend(
			$('<span />', {
				'class': 'ui-icon ui-icon-close',
				'html': '&times;'
			})
		);
	}

	// Create button and setup attributes
	elements.button.appendTo(elements.titlebar || tooltip)
		.attr('role', 'button')
		.click(function(event) {
			if(!tooltip.hasClass(CLASS_DISABLED)) { self.hide(event); }
			return FALSE;
		});
};

PROTOTYPE._updateButton = function(button)
{
	// Make sure tooltip is rendered and if not, return
	if(!this.rendered) { return FALSE; }

	var elem = this.elements.button;
	if(button) { this._createButton(); }
	else { elem.remove(); }
};
;// Widget class creator
function createWidgetClass(cls) {
	return WIDGET.concat('').join(cls ? '-'+cls+' ' : ' ');
}

// Widget class setter method
PROTOTYPE._setWidget = function()
{
	var on = this.options.style.widget,
		elements = this.elements,
		tooltip = elements.tooltip,
		disabled = tooltip.hasClass(CLASS_DISABLED);

	tooltip.removeClass(CLASS_DISABLED);
	CLASS_DISABLED = on ? 'ui-state-disabled' : 'qtip-disabled';
	tooltip.toggleClass(CLASS_DISABLED, disabled);

	tooltip.toggleClass('ui-helper-reset '+createWidgetClass(), on).toggleClass(CLASS_DEFAULT, this.options.style.def && !on);

	if(elements.content) {
		elements.content.toggleClass( createWidgetClass('content'), on);
	}
	if(elements.titlebar) {
		elements.titlebar.toggleClass( createWidgetClass('header'), on);
	}
	if(elements.button) {
		elements.button.toggleClass(NAMESPACE+'-icon', !on);
	}
};
;function delay(callback, duration) {
	// If tooltip has displayed, start hide timer
	if(duration > 0) {
		return setTimeout(
			$.proxy(callback, this), duration
		);
	}
	else{ callback.call(this); }
}

function showMethod(event) {
	if(this.tooltip.hasClass(CLASS_DISABLED)) { return; }

	// Clear hide timers
	clearTimeout(this.timers.show);
	clearTimeout(this.timers.hide);

	// Start show timer
	this.timers.show = delay.call(this,
		function() { this.toggle(TRUE, event); },
		this.options.show.delay
	);
}

function hideMethod(event) {
	if(this.tooltip.hasClass(CLASS_DISABLED) || this.destroyed) { return; }

	// Check if new target was actually the tooltip element
	var relatedTarget = $(event.relatedTarget),
		ontoTooltip = relatedTarget.closest(SELECTOR)[0] === this.tooltip[0],
		ontoTarget = relatedTarget[0] === this.options.show.target[0];

	// Clear timers and stop animation queue
	clearTimeout(this.timers.show);
	clearTimeout(this.timers.hide);

	// Prevent hiding if tooltip is fixed and event target is the tooltip.
	// Or if mouse positioning is enabled and cursor momentarily overlaps
	if(this !== relatedTarget[0] &&
		(this.options.position.target === 'mouse' && ontoTooltip) ||
		this.options.hide.fixed && (
			(/mouse(out|leave|move)/).test(event.type) && (ontoTooltip || ontoTarget))
		)
	{
		/* eslint-disable no-empty */
		try {
			event.preventDefault();
			event.stopImmediatePropagation();
		} catch(e) {}
		/* eslint-enable no-empty */

		return;
	}

	// If tooltip has displayed, start hide timer
	this.timers.hide = delay.call(this,
		function() { this.toggle(FALSE, event); },
		this.options.hide.delay,
		this
	);
}

function inactiveMethod(event) {
	if(this.tooltip.hasClass(CLASS_DISABLED) || !this.options.hide.inactive) { return; }

	// Clear timer
	clearTimeout(this.timers.inactive);

	this.timers.inactive = delay.call(this,
		function(){ this.hide(event); },
		this.options.hide.inactive
	);
}

function repositionMethod(event) {
	if(this.rendered && this.tooltip[0].offsetWidth > 0) { this.reposition(event); }
}

// Store mouse coordinates
PROTOTYPE._storeMouse = function(event) {
	(this.mouse = $.event.fix(event)).type = 'mousemove';
	return this;
};

// Bind events
PROTOTYPE._bind = function(targets, events, method, suffix, context) {
	if(!targets || !method || !events.length) { return; }
	var ns = '.' + this._id + (suffix ? '-'+suffix : '');
	$(targets).bind(
		(events.split ? events : events.join(ns + ' ')) + ns,
		$.proxy(method, context || this)
	);
	return this;
};
PROTOTYPE._unbind = function(targets, suffix) {
	targets && $(targets).unbind('.' + this._id + (suffix ? '-'+suffix : ''));
	return this;
};

// Global delegation helper
function delegate(selector, events, method) {
	$(document.body).delegate(selector,
		(events.split ? events : events.join('.'+NAMESPACE + ' ')) + '.'+NAMESPACE,
		function() {
			var api = QTIP.api[ $.attr(this, ATTR_ID) ];
			api && !api.disabled && method.apply(api, arguments);
		}
	);
}
// Event trigger
PROTOTYPE._trigger = function(type, args, event) {
	var callback = new $.Event('tooltip'+type);
	callback.originalEvent = event && $.extend({}, event) || this.cache.event || NULL;

	this.triggering = type;
	this.tooltip.trigger(callback, [this].concat(args || []));
	this.triggering = FALSE;

	return !callback.isDefaultPrevented();
};

PROTOTYPE._bindEvents = function(showEvents, hideEvents, showTargets, hideTargets, showCallback, hideCallback) {
	// Get tasrgets that lye within both
	var similarTargets = showTargets.filter( hideTargets ).add( hideTargets.filter(showTargets) ),
		toggleEvents = [];

	// If hide and show targets are the same...
	if(similarTargets.length) {

		// Filter identical show/hide events
		$.each(hideEvents, function(i, type) {
			var showIndex = $.inArray(type, showEvents);

			// Both events are identical, remove from both hide and show events
			// and append to toggleEvents
			showIndex > -1 && toggleEvents.push( showEvents.splice( showIndex, 1 )[0] );
		});

		// Toggle events are special case of identical show/hide events, which happen in sequence
		if(toggleEvents.length) {
			// Bind toggle events to the similar targets
			this._bind(similarTargets, toggleEvents, function(event) {
				var state = this.rendered ? this.tooltip[0].offsetWidth > 0 : false;
				(state ? hideCallback : showCallback).call(this, event);
			});

			// Remove the similar targets from the regular show/hide bindings
			showTargets = showTargets.not(similarTargets);
			hideTargets = hideTargets.not(similarTargets);
		}
	}

	// Apply show/hide/toggle events
	this._bind(showTargets, showEvents, showCallback);
	this._bind(hideTargets, hideEvents, hideCallback);
};

PROTOTYPE._assignInitialEvents = function(event) {
	var options = this.options,
		showTarget = options.show.target,
		hideTarget = options.hide.target,
		showEvents = options.show.event ? $.trim('' + options.show.event).split(' ') : [],
		hideEvents = options.hide.event ? $.trim('' + options.hide.event).split(' ') : [];

	// Catch remove/removeqtip events on target element to destroy redundant tooltips
	this._bind(this.elements.target, ['remove', 'removeqtip'], function() {
		this.destroy(true);
	}, 'destroy');

	/*
	 * Make sure hoverIntent functions properly by using mouseleave as a hide event if
	 * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
	 */
	if(/mouse(over|enter)/i.test(options.show.event) && !/mouse(out|leave)/i.test(options.hide.event)) {
		hideEvents.push('mouseleave');
	}

	/*
	 * Also make sure initial mouse targetting works correctly by caching mousemove coords
	 * on show targets before the tooltip has rendered. Also set onTarget when triggered to
	 * keep mouse tracking working.
	 */
	this._bind(showTarget, 'mousemove', function(moveEvent) {
		this._storeMouse(moveEvent);
		this.cache.onTarget = TRUE;
	});

	// Define hoverIntent function
	function hoverIntent(hoverEvent) {
		// Only continue if tooltip isn't disabled
		if(this.disabled || this.destroyed) { return FALSE; }

		// Cache the event data
		this.cache.event = hoverEvent && $.event.fix(hoverEvent);
		this.cache.target = hoverEvent && $(hoverEvent.target);

		// Start the event sequence
		clearTimeout(this.timers.show);
		this.timers.show = delay.call(this,
			function() { this.render(typeof hoverEvent === 'object' || options.show.ready); },
			options.prerender ? 0 : options.show.delay
		);
	}

	// Filter and bind events
	this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, hoverIntent, function() {
		if(!this.timers) { return FALSE; }
		clearTimeout(this.timers.show);
	});

	// Prerendering is enabled, create tooltip now
	if(options.show.ready || options.prerender) { hoverIntent.call(this, event); }
};

// Event assignment method
PROTOTYPE._assignEvents = function() {
	var self = this,
		options = this.options,
		posOptions = options.position,

		tooltip = this.tooltip,
		showTarget = options.show.target,
		hideTarget = options.hide.target,
		containerTarget = posOptions.container,
		viewportTarget = posOptions.viewport,
		documentTarget = $(document),
		windowTarget = $(window),

		showEvents = options.show.event ? $.trim('' + options.show.event).split(' ') : [],
		hideEvents = options.hide.event ? $.trim('' + options.hide.event).split(' ') : [];


	// Assign passed event callbacks
	$.each(options.events, function(name, callback) {
		self._bind(tooltip, name === 'toggle' ? ['tooltipshow','tooltiphide'] : ['tooltip'+name], callback, null, tooltip);
	});

	// Hide tooltips when leaving current window/frame (but not select/option elements)
	if(/mouse(out|leave)/i.test(options.hide.event) && options.hide.leave === 'window') {
		this._bind(documentTarget, ['mouseout', 'blur'], function(event) {
			if(!/select|option/.test(event.target.nodeName) && !event.relatedTarget) {
				this.hide(event);
			}
		});
	}

	// Enable hide.fixed by adding appropriate class
	if(options.hide.fixed) {
		hideTarget = hideTarget.add( tooltip.addClass(CLASS_FIXED) );
	}

	/*
	 * Make sure hoverIntent functions properly by using mouseleave to clear show timer if
	 * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
	 */
	else if(/mouse(over|enter)/i.test(options.show.event)) {
		this._bind(hideTarget, 'mouseleave', function() {
			clearTimeout(this.timers.show);
		});
	}

	// Hide tooltip on document mousedown if unfocus events are enabled
	if(('' + options.hide.event).indexOf('unfocus') > -1) {
		this._bind(containerTarget.closest('html'), ['mousedown', 'touchstart'], function(event) {
			var elem = $(event.target),
				enabled = this.rendered && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0,
				isAncestor = elem.parents(SELECTOR).filter(this.tooltip[0]).length > 0;

			if(elem[0] !== this.target[0] && elem[0] !== this.tooltip[0] && !isAncestor &&
				!this.target.has(elem[0]).length && enabled
			) {
				this.hide(event);
			}
		});
	}

	// Check if the tooltip hides when inactive
	if('number' === typeof options.hide.inactive) {
		// Bind inactive method to show target(s) as a custom event
		this._bind(showTarget, 'qtip-'+this.id+'-inactive', inactiveMethod, 'inactive');

		// Define events which reset the 'inactive' event handler
		this._bind(hideTarget.add(tooltip), QTIP.inactiveEvents, inactiveMethod);
	}

	// Filter and bind events
	this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, showMethod, hideMethod);

	// Mouse movement bindings
	this._bind(showTarget.add(tooltip), 'mousemove', function(event) {
		// Check if the tooltip hides when mouse is moved a certain distance
		if('number' === typeof options.hide.distance) {
			var origin = this.cache.origin || {},
				limit = this.options.hide.distance,
				abs = Math.abs;

			// Check if the movement has gone beyond the limit, and hide it if so
			if(abs(event.pageX - origin.pageX) >= limit || abs(event.pageY - origin.pageY) >= limit) {
				this.hide(event);
			}
		}

		// Cache mousemove coords on show targets
		this._storeMouse(event);
	});

	// Mouse positioning events
	if(posOptions.target === 'mouse') {
		// If mouse adjustment is on...
		if(posOptions.adjust.mouse) {
			// Apply a mouseleave event so we don't get problems with overlapping
			if(options.hide.event) {
				// Track if we're on the target or not
				this._bind(showTarget, ['mouseenter', 'mouseleave'], function(event) {
					if(!this.cache) {return FALSE; }
					this.cache.onTarget = event.type === 'mouseenter';
				});
			}

			// Update tooltip position on mousemove
			this._bind(documentTarget, 'mousemove', function(event) {
				// Update the tooltip position only if the tooltip is visible and adjustment is enabled
				if(this.rendered && this.cache.onTarget && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0) {
					this.reposition(event);
				}
			});
		}
	}

	// Adjust positions of the tooltip on window resize if enabled
	if(posOptions.adjust.resize || viewportTarget.length) {
		this._bind( $.event.special.resize ? viewportTarget : windowTarget, 'resize', repositionMethod );
	}

	// Adjust tooltip position on scroll of the window or viewport element if present
	if(posOptions.adjust.scroll) {
		this._bind( windowTarget.add(posOptions.container), 'scroll', repositionMethod );
	}
};

// Un-assignment method
PROTOTYPE._unassignEvents = function() {
	var options = this.options,
		showTargets = options.show.target,
		hideTargets = options.hide.target,
		targets = $.grep([
			this.elements.target[0],
			this.rendered && this.tooltip[0],
			options.position.container[0],
			options.position.viewport[0],
			options.position.container.closest('html')[0], // unfocus
			window,
			document
		], function(i) {
			return typeof i === 'object';
		});

	// Add show and hide targets if they're valid
	if(showTargets && showTargets.toArray) {
		targets = targets.concat(showTargets.toArray());
	}
	if(hideTargets && hideTargets.toArray) {
		targets = targets.concat(hideTargets.toArray());
	}

	// Unbind the events
	this._unbind(targets)
		._unbind(targets, 'destroy')
		._unbind(targets, 'inactive');
};

// Apply common event handlers using delegate (avoids excessive .bind calls!)
$(function() {
	delegate(SELECTOR, ['mouseenter', 'mouseleave'], function(event) {
		var state = event.type === 'mouseenter',
			tooltip = $(event.currentTarget),
			target = $(event.relatedTarget || event.target),
			options = this.options;

		// On mouseenter...
		if(state) {
			// Focus the tooltip on mouseenter (z-index stacking)
			this.focus(event);

			// Clear hide timer on tooltip hover to prevent it from closing
			tooltip.hasClass(CLASS_FIXED) && !tooltip.hasClass(CLASS_DISABLED) && clearTimeout(this.timers.hide);
		}

		// On mouseleave...
		else {
			// When mouse tracking is enabled, hide when we leave the tooltip and not onto the show target (if a hide event is set)
			if(options.position.target === 'mouse' && options.position.adjust.mouse &&
				options.hide.event && options.show.target && !target.closest(options.show.target[0]).length) {
				this.hide(event);
			}
		}

		// Add hover class
		tooltip.toggleClass(CLASS_HOVER, state);
	});

	// Define events which reset the 'inactive' event handler
	delegate('['+ATTR_ID+']', INACTIVE_EVENTS, inactiveMethod);
});
;// Initialization method
function init(elem, id, opts) {
	var obj, posOptions, attr, config, title,

	// Setup element references
	docBody = $(document.body),

	// Use document body instead of document element if needed
	newTarget = elem[0] === document ? docBody : elem,

	// Grab metadata from element if plugin is present
	metadata = elem.metadata ? elem.metadata(opts.metadata) : NULL,

	// If metadata type if HTML5, grab 'name' from the object instead, or use the regular data object otherwise
	metadata5 = opts.metadata.type === 'html5' && metadata ? metadata[opts.metadata.name] : NULL,

	// Grab data from metadata.name (or data-qtipopts as fallback) using .data() method,
	html5 = elem.data(opts.metadata.name || 'qtipopts');

	// If we don't get an object returned attempt to parse it manualyl without parseJSON
	/* eslint-disable no-empty */
	try { html5 = typeof html5 === 'string' ? $.parseJSON(html5) : html5; }
	catch(e) {}
	/* eslint-enable no-empty */

	// Merge in and sanitize metadata
	config = $.extend(TRUE, {}, QTIP.defaults, opts,
		typeof html5 === 'object' ? sanitizeOptions(html5) : NULL,
		sanitizeOptions(metadata5 || metadata));

	// Re-grab our positioning options now we've merged our metadata and set id to passed value
	posOptions = config.position;
	config.id = id;

	// Setup missing content if none is detected
	if('boolean' === typeof config.content.text) {
		attr = elem.attr(config.content.attr);

		// Grab from supplied attribute if available
		if(config.content.attr !== FALSE && attr) { config.content.text = attr; }

		// No valid content was found, abort render
		else { return FALSE; }
	}

	// Setup target options
	if(!posOptions.container.length) { posOptions.container = docBody; }
	if(posOptions.target === FALSE) { posOptions.target = newTarget; }
	if(config.show.target === FALSE) { config.show.target = newTarget; }
	if(config.show.solo === TRUE) { config.show.solo = posOptions.container.closest('body'); }
	if(config.hide.target === FALSE) { config.hide.target = newTarget; }
	if(config.position.viewport === TRUE) { config.position.viewport = posOptions.container; }

	// Ensure we only use a single container
	posOptions.container = posOptions.container.eq(0);

	// Convert position corner values into x and y strings
	posOptions.at = new CORNER(posOptions.at, TRUE);
	posOptions.my = new CORNER(posOptions.my);

	// Destroy previous tooltip if overwrite is enabled, or skip element if not
	if(elem.data(NAMESPACE)) {
		if(config.overwrite) {
			elem.qtip('destroy', true);
		}
		else if(config.overwrite === FALSE) {
			return FALSE;
		}
	}

	// Add has-qtip attribute
	elem.attr(ATTR_HAS, id);

	// Remove title attribute and store it if present
	if(config.suppress && (title = elem.attr('title'))) {
		// Final attr call fixes event delegatiom and IE default tooltip showing problem
		elem.removeAttr('title').attr(oldtitle, title).attr('title', '');
	}

	// Initialize the tooltip and add API reference
	obj = new QTip(elem, config, id, !!attr);
	elem.data(NAMESPACE, obj);

	return obj;
}

// jQuery $.fn extension method
QTIP = $.fn.qtip = function(options, notation, newValue)
{
	var command = ('' + options).toLowerCase(), // Parse command
		returned = NULL,
		args = $.makeArray(arguments).slice(1),
		event = args[args.length - 1],
		opts = this[0] ? $.data(this[0], NAMESPACE) : NULL;

	// Check for API request
	if(!arguments.length && opts || command === 'api') {
		return opts;
	}

	// Execute API command if present
	else if('string' === typeof options) {
		this.each(function() {
			var api = $.data(this, NAMESPACE);
			if(!api) { return TRUE; }

			// Cache the event if possible
			if(event && event.timeStamp) { api.cache.event = event; }

			// Check for specific API commands
			if(notation && (command === 'option' || command === 'options')) {
				if(newValue !== undefined || $.isPlainObject(notation)) {
					api.set(notation, newValue);
				}
				else {
					returned = api.get(notation);
					return FALSE;
				}
			}

			// Execute API command
			else if(api[command]) {
				api[command].apply(api, args);
			}
		});

		return returned !== NULL ? returned : this;
	}

	// No API commands. validate provided options and setup qTips
	else if('object' === typeof options || !arguments.length) {
		// Sanitize options first
		opts = sanitizeOptions($.extend(TRUE, {}, options));

		return this.each(function(i) {
			var api, id;

			// Find next available ID, or use custom ID if provided
			id = $.isArray(opts.id) ? opts.id[i] : opts.id;
			id = !id || id === FALSE || id.length < 1 || QTIP.api[id] ? QTIP.nextid++ : id;

			// Initialize the qTip and re-grab newly sanitized options
			api = init($(this), id, opts);
			if(api === FALSE) { return TRUE; }
			else { QTIP.api[id] = api; }

			// Initialize plugins
			$.each(PLUGINS, function() {
				if(this.initialize === 'initialize') { this(api); }
			});

			// Assign initial pre-render events
			api._assignInitialEvents(event);
		});
	}
};

// Expose class
$.qtip = QTip;

// Populated in render method
QTIP.api = {};
;$.each({
	/* Allow other plugins to successfully retrieve the title of an element with a qTip applied */
	attr: function(attr, val) {
		if(this.length) {
			var self = this[0],
				title = 'title',
				api = $.data(self, 'qtip');

			if(attr === title && api && api.options && 'object' === typeof api && 'object' === typeof api.options && api.options.suppress) {
				if(arguments.length < 2) {
					return $.attr(self, oldtitle);
				}

				// If qTip is rendered and title was originally used as content, update it
				if(api && api.options.content.attr === title && api.cache.attr) {
					api.set('content.text', val);
				}

				// Use the regular attr method to set, then cache the result
				return this.attr(oldtitle, val);
			}
		}

		return $.fn['attr'+replaceSuffix].apply(this, arguments);
	},

	/* Allow clone to correctly retrieve cached title attributes */
	clone: function(keepData) {
		// Clone our element using the real clone method
		var elems = $.fn['clone'+replaceSuffix].apply(this, arguments);

		// Grab all elements with an oldtitle set, and change it to regular title attribute, if keepData is false
		if(!keepData) {
			elems.filter('['+oldtitle+']').attr('title', function() {
				return $.attr(this, oldtitle);
			})
			.removeAttr(oldtitle);
		}

		return elems;
	}
}, function(name, func) {
	if(!func || $.fn[name+replaceSuffix]) { return TRUE; }

	var old = $.fn[name+replaceSuffix] = $.fn[name];
	$.fn[name] = function() {
		return func.apply(this, arguments) || old.apply(this, arguments);
	};
});

/* Fire off 'removeqtip' handler in $.cleanData if jQuery UI not present (it already does similar).
 * This snippet is taken directly from jQuery UI source code found here:
 *     http://code.jquery.com/ui/jquery-ui-git.js
 */
if(!$.ui) {
	$['cleanData'+replaceSuffix] = $.cleanData;
	$.cleanData = function( elems ) {
		for(var i = 0, elem; (elem = $( elems[i] )).length; i++) {
			if(elem.attr(ATTR_HAS)) {
				/* eslint-disable no-empty */
				try { elem.triggerHandler('removeqtip'); }
				catch( e ) {}
				/* eslint-enable no-empty */
			}
		}
		$['cleanData'+replaceSuffix].apply(this, arguments);
	};
}
;// qTip version
QTIP.version = '3.0.3';

// Base ID for all qTips
QTIP.nextid = 0;

// Inactive events array
QTIP.inactiveEvents = INACTIVE_EVENTS;

// Base z-index for all qTips
QTIP.zindex = 15000;

// Define configuration defaults
QTIP.defaults = {
	prerender: FALSE,
	id: FALSE,
	overwrite: TRUE,
	suppress: TRUE,
	content: {
		text: TRUE,
		attr: 'title',
		title: FALSE,
		button: FALSE
	},
	position: {
		my: 'top left',
		at: 'bottom right',
		target: FALSE,
		container: FALSE,
		viewport: FALSE,
		adjust: {
			x: 0, y: 0,
			mouse: TRUE,
			scroll: TRUE,
			resize: TRUE,
			method: 'flipinvert flipinvert'
		},
		effect: function(api, pos) {
			$(this).animate(pos, {
				duration: 200,
				queue: FALSE
			});
		}
	},
	show: {
		target: FALSE,
		event: 'mouseenter',
		effect: TRUE,
		delay: 90,
		solo: FALSE,
		ready: FALSE,
		autofocus: FALSE
	},
	hide: {
		target: FALSE,
		event: 'mouseleave',
		effect: TRUE,
		delay: 0,
		fixed: FALSE,
		inactive: FALSE,
		leave: 'window',
		distance: FALSE
	},
	style: {
		classes: '',
		widget: FALSE,
		width: FALSE,
		height: FALSE,
		def: TRUE
	},
	events: {
		render: NULL,
		move: NULL,
		show: NULL,
		hide: NULL,
		toggle: NULL,
		visible: NULL,
		hidden: NULL,
		focus: NULL,
		blur: NULL
	}
};
;PLUGINS.viewport = function(api, position, posOptions, targetWidth, targetHeight, elemWidth, elemHeight)
{
	var target = posOptions.target,
		tooltip = api.elements.tooltip,
		my = posOptions.my,
		at = posOptions.at,
		adjust = posOptions.adjust,
		method = adjust.method.split(' '),
		methodX = method[0],
		methodY = method[1] || method[0],
		viewport = posOptions.viewport,
		container = posOptions.container,
		adjusted = { left: 0, top: 0 },
		fixed, newMy, containerOffset, containerStatic,
		viewportWidth, viewportHeight, viewportScroll, viewportOffset;

	// If viewport is not a jQuery element, or it's the window/document, or no adjustment method is used... return
	if(!viewport.jquery || target[0] === window || target[0] === document.body || adjust.method === 'none') {
		return adjusted;
	}

	// Cach container details
	containerOffset = container.offset() || adjusted;
	containerStatic = container.css('position') === 'static';

	// Cache our viewport details
	fixed = tooltip.css('position') === 'fixed';
	viewportWidth = viewport[0] === window ? viewport.width() : viewport.outerWidth(FALSE);
	viewportHeight = viewport[0] === window ? viewport.height() : viewport.outerHeight(FALSE);
	viewportScroll = { left: fixed ? 0 : viewport.scrollLeft(), top: fixed ? 0 : viewport.scrollTop() };
	viewportOffset = viewport.offset() || adjusted;

	// Generic calculation method
	function calculate(side, otherSide, type, adjustment, side1, side2, lengthName, targetLength, elemLength) {
		var initialPos = position[side1],
			mySide = my[side],
			atSide = at[side],
			isShift = type === SHIFT,
			myLength = mySide === side1 ? elemLength : mySide === side2 ? -elemLength : -elemLength / 2,
			atLength = atSide === side1 ? targetLength : atSide === side2 ? -targetLength : -targetLength / 2,
			sideOffset = viewportScroll[side1] + viewportOffset[side1] - (containerStatic ? 0 : containerOffset[side1]),
			overflow1 = sideOffset - initialPos,
			overflow2 = initialPos + elemLength - (lengthName === WIDTH ? viewportWidth : viewportHeight) - sideOffset,
			offset = myLength - (my.precedance === side || mySide === my[otherSide] ? atLength : 0) - (atSide === CENTER ? targetLength / 2 : 0);

		// shift
		if(isShift) {
			offset = (mySide === side1 ? 1 : -1) * myLength;

			// Adjust position but keep it within viewport dimensions
			position[side1] += overflow1 > 0 ? overflow1 : overflow2 > 0 ? -overflow2 : 0;
			position[side1] = Math.max(
				-containerOffset[side1] + viewportOffset[side1],
				initialPos - offset,
				Math.min(
					Math.max(
						-containerOffset[side1] + viewportOffset[side1] + (lengthName === WIDTH ? viewportWidth : viewportHeight),
						initialPos + offset
					),
					position[side1],

					// Make sure we don't adjust complete off the element when using 'center'
					mySide === 'center' ? initialPos - myLength : 1E9
				)
			);

		}

		// flip/flipinvert
		else {
			// Update adjustment amount depending on if using flipinvert or flip
			adjustment *= type === FLIPINVERT ? 2 : 0;

			// Check for overflow on the left/top
			if(overflow1 > 0 && (mySide !== side1 || overflow2 > 0)) {
				position[side1] -= offset + adjustment;
				newMy.invert(side, side1);
			}

			// Check for overflow on the bottom/right
			else if(overflow2 > 0 && (mySide !== side2 || overflow1 > 0)  ) {
				position[side1] -= (mySide === CENTER ? -offset : offset) + adjustment;
				newMy.invert(side, side2);
			}

			// Make sure we haven't made things worse with the adjustment and reset if so
			if(position[side1] < viewportScroll[side1] && -position[side1] > overflow2) {
				position[side1] = initialPos; newMy = my.clone();
			}
		}

		return position[side1] - initialPos;
	}

	// Set newMy if using flip or flipinvert methods
	if(methodX !== 'shift' || methodY !== 'shift') { newMy = my.clone(); }

	// Adjust position based onviewport and adjustment options
	adjusted = {
		left: methodX !== 'none' ? calculate( X, Y, methodX, adjust.x, LEFT, RIGHT, WIDTH, targetWidth, elemWidth ) : 0,
		top: methodY !== 'none' ? calculate( Y, X, methodY, adjust.y, TOP, BOTTOM, HEIGHT, targetHeight, elemHeight ) : 0,
		my: newMy
	};

	return adjusted;
};
;}));
}( window, document ));

!function(){"use strict";function o(o){var t=["MSIE ","Trident/","Edge/"];return new RegExp(t.join("|")).test(o)}function t(){function t(o,t){this.scrollLeft=o,this.scrollTop=t}function r(o){return.5*(1-Math.cos(Math.PI*o))}function i(o){if(null===o||"object"!=typeof o||void 0===o.behavior||"auto"===o.behavior||"instant"===o.behavior)return!0;if("object"==typeof o&&"smooth"===o.behavior)return!1;throw new TypeError("behavior member of ScrollOptions "+o.behavior+" is not a valid value for enumeration ScrollBehavior.")}function s(o,t){return"Y"===t?o.clientHeight+h<o.scrollHeight:"X"===t?o.clientWidth+h<o.scrollWidth:void 0}function c(o,t){var e=l.getComputedStyle(o,null)["overflow"+t];return"auto"===e||"scroll"===e}function n(o){var t=s(o,"Y")&&c(o,"Y"),l=s(o,"X")&&c(o,"X");return t||l}function f(o){var t;do{t=(o=o.parentNode)===e.body}while(!1===t&&!1===n(o));return t=null,o}function a(o){var t,e,i,s=(y()-o.startTime)/v;t=r(s=s>1?1:s),e=o.startX+(o.x-o.startX)*t,i=o.startY+(o.y-o.startY)*t,o.method.call(o.scrollable,e,i),e===o.x&&i===o.y||l.requestAnimationFrame(a.bind(l,o))}function p(o,r,i){var s,c,n,f,p=y();o===e.body?(s=l,c=l.scrollX||l.pageXOffset,n=l.scrollY||l.pageYOffset,f=u.scroll):(s=o,c=o.scrollLeft,n=o.scrollTop,f=t),a({scrollable:s,method:f,startTime:p,startX:c,startY:n,x:r,y:i})}if(!("scrollBehavior"in e.documentElement.style&&!0!==l.__forceSmoothScrollPolyfill__)){var d=l.HTMLElement||l.Element,v=468,h=o(l.navigator.userAgent)?1:0,u={scroll:l.scroll||l.scrollTo,scrollBy:l.scrollBy,elementScroll:d.prototype.scroll||t,scrollIntoView:d.prototype.scrollIntoView},y=l.performance&&l.performance.now?l.performance.now.bind(l.performance):Date.now;l.scroll=l.scrollTo=function(){void 0!==arguments[0]&&(!0!==i(arguments[0])?p.call(l,e.body,void 0!==arguments[0].left?~~arguments[0].left:l.scrollX||l.pageXOffset,void 0!==arguments[0].top?~~arguments[0].top:l.scrollY||l.pageYOffset):u.scroll.call(l,void 0!==arguments[0].left?arguments[0].left:"object"!=typeof arguments[0]?arguments[0]:l.scrollX||l.pageXOffset,void 0!==arguments[0].top?arguments[0].top:void 0!==arguments[1]?arguments[1]:l.scrollY||l.pageYOffset))},l.scrollBy=function(){void 0!==arguments[0]&&(i(arguments[0])?u.scrollBy.call(l,void 0!==arguments[0].left?arguments[0].left:"object"!=typeof arguments[0]?arguments[0]:0,void 0!==arguments[0].top?arguments[0].top:void 0!==arguments[1]?arguments[1]:0):p.call(l,e.body,~~arguments[0].left+(l.scrollX||l.pageXOffset),~~arguments[0].top+(l.scrollY||l.pageYOffset)))},d.prototype.scroll=d.prototype.scrollTo=function(){if(void 0!==arguments[0])if(!0!==i(arguments[0])){var o=arguments[0].left,t=arguments[0].top;p.call(this,this,void 0===o?this.scrollLeft:~~o,void 0===t?this.scrollTop:~~t)}else{if("number"==typeof arguments[0]&&void 0===arguments[1])throw new SyntaxError("Value couldn't be converted");u.elementScroll.call(this,void 0!==arguments[0].left?~~arguments[0].left:"object"!=typeof arguments[0]?~~arguments[0]:this.scrollLeft,void 0!==arguments[0].top?~~arguments[0].top:void 0!==arguments[1]?~~arguments[1]:this.scrollTop)}},d.prototype.scrollBy=function(){void 0!==arguments[0]&&(!0!==i(arguments[0])?this.scroll({left:~~arguments[0].left+this.scrollLeft,top:~~arguments[0].top+this.scrollTop,behavior:arguments[0].behavior}):u.elementScroll.call(this,void 0!==arguments[0].left?~~arguments[0].left+this.scrollLeft:~~arguments[0]+this.scrollLeft,void 0!==arguments[0].top?~~arguments[0].top+this.scrollTop:~~arguments[1]+this.scrollTop))},d.prototype.scrollIntoView=function(){if(!0!==i(arguments[0])){var o=f(this),t=o.getBoundingClientRect(),r=this.getBoundingClientRect();o!==e.body?(p.call(this,o,o.scrollLeft+r.left-t.left,o.scrollTop+r.top-t.top),"fixed"!==l.getComputedStyle(o).position&&l.scrollBy({left:t.left,top:t.top,behavior:"smooth"})):l.scrollBy({left:r.left,top:r.top,behavior:"smooth"})}else u.scrollIntoView.call(this,void 0===arguments[0]||arguments[0])}}}var l=window,e=document;"object"==typeof exports?module.exports={polyfill:t}:t()}();

// ==================================================
// fancyBox v3.1.28
//
// Licensed GPLv3 for open source use
// or fancyBox Commercial License for commercial use
//
// http://fancyapps.com/fancybox/
// Copyright 2017 fancyApps
//
// ==================================================
;!function(t,e,n,o){"use strict";function i(t){var e=t.currentTarget,o=t.data?t.data.options:{},i=o.selector?n(o.selector):t.data?t.data.items:[],a=n(e).attr("data-fancybox")||"",s=0,r=n.fancybox.getInstance();t.preventDefault(),r&&r.current.opts.$orig.is(e)||(a?(i=i.length?i.filter('[data-fancybox="'+a+'"]'):n('[data-fancybox="'+a+'"]'),s=i.index(e),s<0&&(s=0)):i=[e],n.fancybox.open(i,o,s))}if(n){if(n.fn.fancybox)return void n.error("fancyBox already initialized");var a={loop:!1,margin:[44,0],gutter:50,keyboard:!0,arrows:!0,infobar:!1,toolbar:!0,buttons:["slideShow","fullScreen","thumbs","close"],idleTime:4,smallBtn:"auto",protect:!1,modal:!1,image:{preload:"auto"},ajax:{settings:{data:{fancybox:!0}}},iframe:{tpl:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen allowtransparency="true" src=""></iframe>',preload:!0,css:{},attr:{scrolling:"auto"}},animationEffect:"zoom",animationDuration:366,zoomOpacity:"auto",transitionEffect:"fade",transitionDuration:366,slideClass:"",baseClass:"",baseTpl:'<div class="fancybox-container" role="dialog" tabindex="-1"><div class="fancybox-bg"></div><div class="fancybox-inner"><div class="fancybox-infobar"><button data-fancybox-prev title="{{PREV}}" class="fancybox-button fancybox-button--left"></button><div class="fancybox-infobar__body"><span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span></div><button data-fancybox-next title="{{NEXT}}" class="fancybox-button fancybox-button--right"></button></div><div class="fancybox-toolbar">{{BUTTONS}}</div><div class="fancybox-navigation"><button data-fancybox-prev title="{{PREV}}" class="fancybox-arrow fancybox-arrow--left" /><button data-fancybox-next title="{{NEXT}}" class="fancybox-arrow fancybox-arrow--right" /></div><div class="fancybox-stage"></div><div class="fancybox-caption-wrap"><div class="fancybox-caption"></div></div></div></div>',spinnerTpl:'<div class="fancybox-loading"></div>',errorTpl:'<div class="fancybox-error"><p>{{ERROR}}<p></div>',btnTpl:{slideShow:'<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"></button>',fullScreen:'<button data-fancybox-fullscreen class="fancybox-button fancybox-button--fullscreen" title="{{FULL_SCREEN}}"></button>',thumbs:'<button data-fancybox-thumbs class="fancybox-button fancybox-button--thumbs" title="{{THUMBS}}"></button>',close:'<button data-fancybox-close class="fancybox-button fancybox-button--close" title="{{CLOSE}}"></button>',smallBtn:'<button data-fancybox-close class="fancybox-close-small" title="{{CLOSE}}"></button>'},parentEl:"body",autoFocus:!0,backFocus:!0,trapFocus:!0,fullScreen:{autoStart:!1},touch:{vertical:!0,momentum:!0},hash:null,media:{},slideShow:{autoStart:!1,speed:4e3},thumbs:{autoStart:!1,hideOnClose:!0},onInit:n.noop,beforeLoad:n.noop,afterLoad:n.noop,beforeShow:n.noop,afterShow:n.noop,beforeClose:n.noop,afterClose:n.noop,onActivate:n.noop,onDeactivate:n.noop,clickContent:function(t,e){return"image"===t.type&&"zoom"},clickSlide:"close",clickOutside:"close",dblclickContent:!1,dblclickSlide:!1,dblclickOutside:!1,mobile:{clickContent:function(t,e){return"image"===t.type&&"toggleControls"},clickSlide:function(t,e){return"image"===t.type?"toggleControls":"close"},dblclickContent:function(t,e){return"image"===t.type&&"zoom"},dblclickSlide:function(t,e){return"image"===t.type&&"zoom"}},lang:"en",i18n:{en:{CLOSE:"Close",NEXT:"Next",PREV:"Previous",ERROR:"The requested content cannot be loaded. <br/> Please try again later.",PLAY_START:"Start slideshow",PLAY_STOP:"Pause slideshow",FULL_SCREEN:"Full screen",THUMBS:"Thumbnails"},de:{CLOSE:"Schliessen",NEXT:"Weiter",PREV:"Zurück",ERROR:"Die angeforderten Daten konnten nicht geladen werden. <br/> Bitte versuchen Sie es später nochmal.",PLAY_START:"Diaschau starten",PLAY_STOP:"Diaschau beenden",FULL_SCREEN:"Vollbild",THUMBS:"Vorschaubilder"}}},s=n(t),r=n(e),c=0,l=function(t){return t&&t.hasOwnProperty&&t instanceof n},u=function(){return t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||function(e){return t.setTimeout(e,1e3/60)}}(),d=function(){var t,n=e.createElement("fakeelement"),i={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(t in i)if(n.style[t]!==o)return i[t]}(),f=function(t){return t&&t.length&&t[0].offsetHeight},h=function(t,o,i){var s=this;s.opts=n.extend(!0,{index:i},a,o||{}),o&&n.isArray(o.buttons)&&(s.opts.buttons=o.buttons),s.id=s.opts.id||++c,s.group=[],s.currIndex=parseInt(s.opts.index,10)||0,s.prevIndex=null,s.prevPos=null,s.currPos=0,s.firstRun=null,s.createGroup(t),s.group.length&&(s.$lastFocus=n(e.activeElement).blur(),s.slides={},s.init(t))};n.extend(h.prototype,{init:function(){var t,e,o,i=this,a=i.group[i.currIndex].opts;i.scrollTop=r.scrollTop(),i.scrollLeft=r.scrollLeft(),n.fancybox.getInstance()||n.fancybox.isMobile||"hidden"===n("body").css("overflow")||(t=n("body").width(),n("html").addClass("fancybox-enabled"),t=n("body").width()-t,t>1&&n("head").append('<style id="fancybox-style-noscroll" type="text/css">.compensate-for-scrollbar, .fancybox-enabled body { margin-right: '+t+"px; }</style>")),o="",n.each(a.buttons,function(t,e){o+=a.btnTpl[e]||""}),e=n(i.translate(i,a.baseTpl.replace("{{BUTTONS}}",o))).addClass("fancybox-is-hidden").attr("id","fancybox-container-"+i.id).addClass(a.baseClass).data("FancyBox",i).prependTo(a.parentEl),i.$refs={container:e},["bg","inner","infobar","toolbar","stage","caption"].forEach(function(t){i.$refs[t]=e.find(".fancybox-"+t)}),(!a.arrows||i.group.length<2)&&e.find(".fancybox-navigation").remove(),a.infobar||i.$refs.infobar.remove(),a.toolbar||i.$refs.toolbar.remove(),i.trigger("onInit"),i.activate(),i.jumpTo(i.currIndex)},translate:function(t,e){var n=t.opts.i18n[t.opts.lang];return e.replace(/\{\{(\w+)\}\}/g,function(t,e){var i=n[e];return i===o?t:i})},createGroup:function(t){var e=this,i=n.makeArray(t);n.each(i,function(t,i){var a,s,r,c,l={},u={},d=[];n.isPlainObject(i)?(l=i,u=i.opts||i):"object"===n.type(i)&&n(i).length?(a=n(i),d=a.data(),u="options"in d?d.options:{},u="object"===n.type(u)?u:{},l.src="src"in d?d.src:u.src||a.attr("href"),["width","height","thumb","type","filter"].forEach(function(t){t in d&&(u[t]=d[t])}),"srcset"in d&&(u.image={srcset:d.srcset}),u.$orig=a,l.type||l.src||(l.type="inline",l.src=i)):l={type:"html",src:i+""},l.opts=n.extend(!0,{},e.opts,u),n.fancybox.isMobile&&(l.opts=n.extend(!0,{},l.opts,l.opts.mobile)),s=l.type||l.opts.type,r=l.src||"",!s&&r&&(r.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i)?s="image":r.match(/\.(pdf)((\?|#).*)?$/i)?s="pdf":"#"===r.charAt(0)&&(s="inline")),l.type=s,l.index=e.group.length,l.opts.$orig&&!l.opts.$orig.length&&delete l.opts.$orig,!l.opts.$thumb&&l.opts.$orig&&(l.opts.$thumb=l.opts.$orig.find("img:first")),l.opts.$thumb&&!l.opts.$thumb.length&&delete l.opts.$thumb,"function"===n.type(l.opts.caption)?l.opts.caption=l.opts.caption.apply(i,[e,l]):"caption"in d&&(l.opts.caption=d.caption),l.opts.caption=l.opts.caption===o?"":l.opts.caption+"","ajax"===s&&(c=r.split(/\s+/,2),c.length>1&&(l.src=c.shift(),l.opts.filter=c.shift())),"auto"==l.opts.smallBtn&&(n.inArray(s,["html","inline","ajax"])>-1?(l.opts.toolbar=!1,l.opts.smallBtn=!0):l.opts.smallBtn=!1),"pdf"===s&&(l.type="iframe",l.opts.iframe.preload=!1),l.opts.modal&&(l.opts=n.extend(!0,l.opts,{infobar:0,toolbar:0,smallBtn:0,keyboard:0,slideShow:0,fullScreen:0,thumbs:0,touch:0,clickContent:!1,clickSlide:!1,clickOutside:!1,dblclickContent:!1,dblclickSlide:!1,dblclickOutside:!1})),e.group.push(l)})},addEvents:function(){var o=this;o.removeEvents(),o.$refs.container.on("click.fb-close","[data-fancybox-close]",function(t){t.stopPropagation(),t.preventDefault(),o.close(t)}).on("click.fb-prev touchend.fb-prev","[data-fancybox-prev]",function(t){t.stopPropagation(),t.preventDefault(),o.previous()}).on("click.fb-next touchend.fb-next","[data-fancybox-next]",function(t){t.stopPropagation(),t.preventDefault(),o.next()}),s.on("orientationchange.fb resize.fb",function(t){t&&t.originalEvent&&"resize"===t.originalEvent.type?u(function(){o.update()}):(o.$refs.stage.hide(),setTimeout(function(){o.$refs.stage.show(),o.update()},500))}),r.on("focusin.fb",function(t){var i=n.fancybox?n.fancybox.getInstance():null;i.isClosing||!i.current||!i.current.opts.trapFocus||n(t.target).hasClass("fancybox-container")||n(t.target).is(e)||i&&"fixed"!==n(t.target).css("position")&&!i.$refs.container.has(t.target).length&&(t.stopPropagation(),i.focus(),s.scrollTop(o.scrollTop).scrollLeft(o.scrollLeft))}),r.on("keydown.fb",function(t){var e=o.current,i=t.keyCode||t.which;if(e&&e.opts.keyboard&&!n(t.target).is("input")&&!n(t.target).is("textarea"))return 8===i||27===i?(t.preventDefault(),void o.close(t)):37===i||38===i?(t.preventDefault(),void o.previous()):39===i||40===i?(t.preventDefault(),void o.next()):void o.trigger("afterKeydown",t,i)}),o.group[o.currIndex].opts.idleTime&&(o.idleSecondsCounter=0,r.on("mousemove.fb-idle mouseenter.fb-idle mouseleave.fb-idle mousedown.fb-idle touchstart.fb-idle touchmove.fb-idle scroll.fb-idle keydown.fb-idle",function(){o.idleSecondsCounter=0,o.isIdle&&o.showControls(),o.isIdle=!1}),o.idleInterval=t.setInterval(function(){o.idleSecondsCounter++,o.idleSecondsCounter>=o.group[o.currIndex].opts.idleTime&&(o.isIdle=!0,o.idleSecondsCounter=0,o.hideControls())},1e3))},removeEvents:function(){var e=this;s.off("orientationchange.fb resize.fb"),r.off("focusin.fb keydown.fb .fb-idle"),this.$refs.container.off(".fb-close .fb-prev .fb-next"),e.idleInterval&&(t.clearInterval(e.idleInterval),e.idleInterval=null)},previous:function(t){return this.jumpTo(this.currPos-1,t)},next:function(t){return this.jumpTo(this.currPos+1,t)},jumpTo:function(t,e,i){var a,s,r,c,l,u,d,h=this,p=h.group.length;if(!(h.isSliding||h.isClosing||h.isAnimating&&h.firstRun)){if(t=parseInt(t,10),s=h.current?h.current.opts.loop:h.opts.loop,!s&&(t<0||t>=p))return!1;if(a=h.firstRun=null===h.firstRun,!(p<2&&!a&&h.isSliding)){if(c=h.current,h.prevIndex=h.currIndex,h.prevPos=h.currPos,r=h.createSlide(t),p>1&&((s||r.index>0)&&h.createSlide(t-1),(s||r.index<p-1)&&h.createSlide(t+1)),h.current=r,h.currIndex=r.index,h.currPos=r.pos,h.trigger("beforeShow",a),h.updateControls(),u=n.fancybox.getTranslate(r.$slide),r.isMoved=(0!==u.left||0!==u.top)&&!r.$slide.hasClass("fancybox-animated"),r.forcedDuration=o,n.isNumeric(e)?r.forcedDuration=e:e=r.opts[a?"animationDuration":"transitionDuration"],e=parseInt(e,10),a)return r.opts.animationEffect&&e&&h.$refs.container.css("transition-duration",e+"ms"),h.$refs.container.removeClass("fancybox-is-hidden"),f(h.$refs.container),h.$refs.container.addClass("fancybox-is-open"),r.$slide.addClass("fancybox-slide--current"),h.loadSlide(r),void h.preload();n.each(h.slides,function(t,e){n.fancybox.stop(e.$slide)}),r.$slide.removeClass("fancybox-slide--next fancybox-slide--previous").addClass("fancybox-slide--current"),r.isMoved?(l=Math.round(r.$slide.width()),n.each(h.slides,function(t,o){var i=o.pos-r.pos;n.fancybox.animate(o.$slide,{top:0,left:i*l+i*o.opts.gutter},e,function(){o.$slide.removeAttr("style").removeClass("fancybox-slide--next fancybox-slide--previous"),o.pos===h.currPos&&(r.isMoved=!1,h.complete())})})):h.$refs.stage.children().removeAttr("style"),r.isLoaded?h.revealContent(r):h.loadSlide(r),h.preload(),c.pos!==r.pos&&(d="fancybox-slide--"+(c.pos>r.pos?"next":"previous"),c.$slide.removeClass("fancybox-slide--complete fancybox-slide--current fancybox-slide--next fancybox-slide--previous"),c.isComplete=!1,e&&(r.isMoved||r.opts.transitionEffect)&&(r.isMoved?c.$slide.addClass(d):(d="fancybox-animated "+d+" fancybox-fx-"+r.opts.transitionEffect,n.fancybox.animate(c.$slide,d,e,function(){c.$slide.removeClass(d).removeAttr("style")}))))}}},createSlide:function(t){var e,o,i=this;return o=t%i.group.length,o=o<0?i.group.length+o:o,!i.slides[t]&&i.group[o]&&(e=n('<div class="fancybox-slide"></div>').appendTo(i.$refs.stage),i.slides[t]=n.extend(!0,{},i.group[o],{pos:t,$slide:e,isLoaded:!1}),i.updateSlide(i.slides[t])),i.slides[t]},scaleToActual:function(t,e,i){var a,s,r,c,l,u=this,d=u.current,f=d.$content,h=parseInt(d.$slide.width(),10),p=parseInt(d.$slide.height(),10),g=d.width,b=d.height;"image"!=d.type||d.hasError||!f||u.isAnimating||(n.fancybox.stop(f),u.isAnimating=!0,t=t===o?.5*h:t,e=e===o?.5*p:e,a=n.fancybox.getTranslate(f),c=g/a.width,l=b/a.height,s=.5*h-.5*g,r=.5*p-.5*b,g>h&&(s=a.left*c-(t*c-t),s>0&&(s=0),s<h-g&&(s=h-g)),b>p&&(r=a.top*l-(e*l-e),r>0&&(r=0),r<p-b&&(r=p-b)),u.updateCursor(g,b),n.fancybox.animate(f,{top:r,left:s,scaleX:c,scaleY:l},i||330,function(){u.isAnimating=!1}),u.SlideShow&&u.SlideShow.isActive&&u.SlideShow.stop())},scaleToFit:function(t){var e,o=this,i=o.current,a=i.$content;"image"!=i.type||i.hasError||!a||o.isAnimating||(n.fancybox.stop(a),o.isAnimating=!0,e=o.getFitPos(i),o.updateCursor(e.width,e.height),n.fancybox.animate(a,{top:e.top,left:e.left,scaleX:e.width/a.width(),scaleY:e.height/a.height()},t||330,function(){o.isAnimating=!1}))},getFitPos:function(t){var e,o,i,a,r,c=this,l=t.$content,u=t.width,d=t.height,f=t.opts.margin;return!(!l||!l.length||!u&&!d)&&("number"===n.type(f)&&(f=[f,f]),2==f.length&&(f=[f[0],f[1],f[0],f[1]]),s.width()<800&&(f=[0,0,0,0]),e=parseInt(c.$refs.stage.width(),10)-(f[1]+f[3]),o=parseInt(c.$refs.stage.height(),10)-(f[0]+f[2]),i=Math.min(1,e/u,o/d),a=Math.floor(i*u),r=Math.floor(i*d),{top:Math.floor(.5*(o-r))+f[0],left:Math.floor(.5*(e-a))+f[3],width:a,height:r})},update:function(){var t=this;n.each(t.slides,function(e,n){t.updateSlide(n)})},updateSlide:function(t){var e=this,o=t.$content;o&&(t.width||t.height)&&(n.fancybox.stop(o),n.fancybox.setTranslate(o,e.getFitPos(t)),t.pos===e.currPos&&e.updateCursor()),t.$slide.trigger("refresh"),e.trigger("onUpdate",t)},updateCursor:function(t,e){var n,i=this,a=i.$refs.container.removeClass("fancybox-is-zoomable fancybox-can-zoomIn fancybox-can-drag fancybox-can-zoomOut");i.current&&!i.isClosing&&(i.isZoomable()?(a.addClass("fancybox-is-zoomable"),n=t!==o&&e!==o?t<i.current.width&&e<i.current.height:i.isScaledDown(),n?a.addClass("fancybox-can-zoomIn"):i.current.opts.touch?a.addClass("fancybox-can-drag"):a.addClass("fancybox-can-zoomOut")):i.current.opts.touch&&a.addClass("fancybox-can-drag"))},isZoomable:function(){var t,e=this,o=e.current;if(o&&!e.isClosing)return!!("image"===o.type&&o.isLoaded&&!o.hasError&&("zoom"===o.opts.clickContent||n.isFunction(o.opts.clickContent)&&"zoom"===o.opts.clickContent(o))&&(t=e.getFitPos(o),o.width>t.width||o.height>t.height))},isScaledDown:function(){var t=this,e=t.current,o=e.$content,i=!1;return o&&(i=n.fancybox.getTranslate(o),i=i.width<e.width||i.height<e.height),i},canPan:function(){var t=this,e=t.current,n=e.$content,o=!1;return n&&(o=t.getFitPos(e),o=Math.abs(n.width()-o.width)>1||Math.abs(n.height()-o.height)>1),o},loadSlide:function(t){var e,o,i,a=this;if(!t.isLoading&&!t.isLoaded){switch(t.isLoading=!0,a.trigger("beforeLoad",t),e=t.type,o=t.$slide,o.off("refresh").trigger("onReset").addClass("fancybox-slide--"+(e||"unknown")).addClass(t.opts.slideClass),e){case"image":a.setImage(t);break;case"iframe":a.setIframe(t);break;case"html":a.setContent(t,t.src||t.content);break;case"inline":n(t.src).length?a.setContent(t,n(t.src)):a.setError(t);break;case"ajax":a.showLoading(t),i=n.ajax(n.extend({},t.opts.ajax.settings,{url:t.src,success:function(e,n){"success"===n&&a.setContent(t,e)},error:function(e,n){e&&"abort"!==n&&a.setError(t)}})),o.one("onReset",function(){i.abort()});break;default:a.setError(t)}return!0}},setImage:function(e){var o,i,a,s,r=this,c=e.opts.image.srcset;if(c){a=t.devicePixelRatio||1,s=t.innerWidth*a,i=c.split(",").map(function(t){var e={};return t.trim().split(/\s+/).forEach(function(t,n){var o=parseInt(t.substring(0,t.length-1),10);return 0===n?e.url=t:void(o&&(e.value=o,e.postfix=t[t.length-1]))}),e}),i.sort(function(t,e){return t.value-e.value});for(var l=0;l<i.length;l++){var u=i[l];if("w"===u.postfix&&u.value>=s||"x"===u.postfix&&u.value>=a){o=u;break}}!o&&i.length&&(o=i[i.length-1]),o&&(e.src=o.url,e.width&&e.height&&"w"==o.postfix&&(e.height=e.width/e.height*o.value,e.width=o.value))}e.$content=n('<div class="fancybox-image-wrap"></div>').addClass("fancybox-is-hidden").appendTo(e.$slide),e.opts.preload!==!1&&e.opts.width&&e.opts.height&&(e.opts.thumb||e.opts.$thumb)?(e.width=e.opts.width,e.height=e.opts.height,e.$ghost=n("<img />").one("error",function(){n(this).remove(),e.$ghost=null,r.setBigImage(e)}).one("load",function(){r.afterLoad(e),r.setBigImage(e)}).addClass("fancybox-image").appendTo(e.$content).attr("src",e.opts.thumb||e.opts.$thumb.attr("src"))):r.setBigImage(e)},setBigImage:function(t){var e=this,o=n("<img />");t.$image=o.one("error",function(){e.setError(t)}).one("load",function(){clearTimeout(t.timouts),t.timouts=null,e.isClosing||(t.width=this.naturalWidth,t.height=this.naturalHeight,t.opts.image.srcset&&o.attr("sizes","100vw").attr("srcset",t.opts.image.srcset),e.hideLoading(t),t.$ghost?t.timouts=setTimeout(function(){t.timouts=null,t.$ghost.hide()},Math.min(300,Math.max(1e3,t.height/1600))):e.afterLoad(t))}).addClass("fancybox-image").attr("src",t.src).appendTo(t.$content),(o[0].complete||"complete"==o[0].readyState)&&o[0].naturalWidth&&o[0].naturalHeight?o.trigger("load"):o[0].error?o.trigger("error"):t.timouts=setTimeout(function(){o[0].complete||t.hasError||e.showLoading(t)},100)},setIframe:function(t){var e,i=this,a=t.opts.iframe,s=t.$slide;t.$content=n('<div class="fancybox-content'+(a.preload?" fancybox-is-hidden":"")+'"></div>').css(a.css).appendTo(s),e=n(a.tpl.replace(/\{rnd\}/g,(new Date).getTime())).attr(a.attr).appendTo(t.$content),a.preload?(i.showLoading(t),e.on("load.fb error.fb",function(e){this.isReady=1,t.$slide.trigger("refresh"),i.afterLoad(t)}),s.on("refresh.fb",function(){var n,i,s,r=t.$content,c=a.css.width,l=a.css.height;if(1===e[0].isReady){try{i=e.contents(),s=i.find("body")}catch(t){}s&&s.length&&(c===o&&(n=e[0].contentWindow.document.documentElement.scrollWidth,c=Math.ceil(s.outerWidth(!0)+(r.width()-n)),c+=r.outerWidth()-r.innerWidth()),l===o&&(l=Math.ceil(s.outerHeight(!0)),l+=r.outerHeight()-r.innerHeight()),c&&r.width(c),l&&r.height(l)),r.removeClass("fancybox-is-hidden")}})):this.afterLoad(t),e.attr("src",t.src),t.opts.smallBtn===!0&&t.$content.prepend(i.translate(t,t.opts.btnTpl.smallBtn)),s.one("onReset",function(){try{n(this).find("iframe").hide().attr("src","//about:blank")}catch(t){}n(this).empty(),t.isLoaded=!1})},setContent:function(t,e){var o=this;o.isClosing||(o.hideLoading(t),t.$slide.empty(),l(e)&&e.parent().length?(e.parent(".fancybox-slide--inline").trigger("onReset"),t.$placeholder=n("<div></div>").hide().insertAfter(e),e.css("display","inline-block")):t.hasError||("string"===n.type(e)&&(e=n("<div>").append(n.trim(e)).contents(),3===e[0].nodeType&&(e=n("<div>").html(e))),t.opts.filter&&(e=n("<div>").html(e).find(t.opts.filter))),t.$slide.one("onReset",function(){t.$placeholder&&(t.$placeholder.after(e.hide()).remove(),t.$placeholder=null),t.$smallBtn&&(t.$smallBtn.remove(),t.$smallBtn=null),t.hasError||(n(this).empty(),t.isLoaded=!1)}),t.$content=n(e).appendTo(t.$slide),t.opts.smallBtn&&!t.$smallBtn&&(t.$smallBtn=n(o.translate(t,t.opts.btnTpl.smallBtn)).appendTo(t.$content.filter("div").first())),this.afterLoad(t))},setError:function(t){t.hasError=!0,t.$slide.removeClass("fancybox-slide--"+t.type),this.setContent(t,this.translate(t,t.opts.errorTpl))},showLoading:function(t){var e=this;t=t||e.current,t&&!t.$spinner&&(t.$spinner=n(e.opts.spinnerTpl).appendTo(t.$slide))},hideLoading:function(t){var e=this;t=t||e.current,t&&t.$spinner&&(t.$spinner.remove(),delete t.$spinner)},afterLoad:function(t){var e=this;e.isClosing||(t.isLoading=!1,t.isLoaded=!0,e.trigger("afterLoad",t),e.hideLoading(t),t.opts.protect&&t.$content&&!t.hasError&&(t.$content.on("contextmenu.fb",function(t){return 2==t.button&&t.preventDefault(),!0}),"image"===t.type&&n('<div class="fancybox-spaceball"></div>').appendTo(t.$content)),e.revealContent(t))},revealContent:function(t){var e,i,a,s,r,c=this,l=t.$slide,u=!1;return e=t.opts[c.firstRun?"animationEffect":"transitionEffect"],a=t.opts[c.firstRun?"animationDuration":"transitionDuration"],a=parseInt(t.forcedDuration===o?a:t.forcedDuration,10),!t.isMoved&&t.pos===c.currPos&&a||(e=!1),"zoom"!==e||t.pos===c.currPos&&a&&"image"===t.type&&!t.hasError&&(u=c.getThumbPos(t))||(e="fade"),"zoom"===e?(r=c.getFitPos(t),r.scaleX=r.width/u.width,r.scaleY=r.height/u.height,delete r.width,delete r.height,s=t.opts.zoomOpacity,"auto"==s&&(s=Math.abs(t.width/t.height-u.width/u.height)>.1),s&&(u.opacity=.1,r.opacity=1),n.fancybox.setTranslate(t.$content.removeClass("fancybox-is-hidden"),u),f(t.$content),void n.fancybox.animate(t.$content,r,a,function(){c.complete()})):(c.updateSlide(t),e?(n.fancybox.stop(l),i="fancybox-animated fancybox-slide--"+(t.pos>c.prevPos?"next":"previous")+" fancybox-fx-"+e,l.removeAttr("style").removeClass("fancybox-slide--current fancybox-slide--next fancybox-slide--previous").addClass(i),t.$content.removeClass("fancybox-is-hidden"),f(l),void n.fancybox.animate(l,"fancybox-slide--current",a,function(e){l.removeClass(i).removeAttr("style"),t.pos===c.currPos&&c.complete()},!0)):(f(l),t.$content.removeClass("fancybox-is-hidden"),void(t.pos===c.currPos&&c.complete())))},getThumbPos:function(o){var i,a=this,s=!1,r=function(e){for(var o,i=e[0],a=i.getBoundingClientRect(),s=[];null!==i.parentElement;)"hidden"!==n(i.parentElement).css("overflow")&&"auto"!==n(i.parentElement).css("overflow")||s.push(i.parentElement.getBoundingClientRect()),i=i.parentElement;return o=s.every(function(t){var e=Math.min(a.right,t.right)-Math.max(a.left,t.left),n=Math.min(a.bottom,t.bottom)-Math.max(a.top,t.top);return e>0&&n>0}),o&&a.bottom>0&&a.right>0&&a.left<n(t).width()&&a.top<n(t).height()},c=o.opts.$thumb,l=c?c.offset():0;return l&&c[0].ownerDocument===e&&r(c)&&(i=a.$refs.stage.offset(),s={top:l.top-i.top+parseFloat(c.css("border-top-width")||0),left:l.left-i.left+parseFloat(c.css("border-left-width")||0),width:c.width(),height:c.height(),scaleX:1,scaleY:1}),s},complete:function(){var t=this,o=t.current,i={};o.isMoved||!o.isLoaded||o.isComplete||(o.isComplete=!0,o.$slide.siblings().trigger("onReset"),f(o.$slide),o.$slide.addClass("fancybox-slide--complete"),n.each(t.slides,function(e,o){o.pos>=t.currPos-1&&o.pos<=t.currPos+1?i[o.pos]=o:o&&(n.fancybox.stop(o.$slide),o.$slide.off().remove())}),t.slides=i,t.updateCursor(),t.trigger("afterShow"),(n(e.activeElement).is("[disabled]")||o.opts.autoFocus&&"image"!=o.type&&"iframe"!==o.type)&&t.focus())},preload:function(){var t,e,n=this;n.group.length<2||(t=n.slides[n.currPos+1],e=n.slides[n.currPos-1],t&&"image"===t.type&&n.loadSlide(t),e&&"image"===e.type&&n.loadSlide(e))},focus:function(){var t,e=this.current;this.isClosing||(e&&e.isComplete&&(t=e.$slide.find("input[autofocus]:enabled:visible:first"),t.length||(t=e.$slide.find("button,:input,[tabindex],a").filter(":enabled:visible:first"))),t=t&&t.length?t:this.$refs.container,t.focus())},activate:function(){var t=this;n(".fancybox-container").each(function(){var e=n(this).data("FancyBox");e&&e.uid!==t.uid&&!e.isClosing&&e.trigger("onDeactivate")}),t.current&&(t.$refs.container.index()>0&&t.$refs.container.prependTo(e.body),t.updateControls()),t.trigger("onActivate"),t.addEvents()},close:function(t,e){var o,i,a,s,r,c,l=this,f=l.current,h=function(){l.cleanUp(t)};return!l.isClosing&&(l.isClosing=!0,l.trigger("beforeClose",t)===!1?(l.isClosing=!1,u(function(){l.update()}),!1):(l.removeEvents(),f.timouts&&clearTimeout(f.timouts),a=f.$content,o=f.opts.animationEffect,i=n.isNumeric(e)?e:o?f.opts.animationDuration:0,f.$slide.off(d).removeClass("fancybox-slide--complete fancybox-slide--next fancybox-slide--previous fancybox-animated"),f.$slide.siblings().trigger("onReset").remove(),i&&l.$refs.container.removeClass("fancybox-is-open").addClass("fancybox-is-closing"),l.hideLoading(f),l.hideControls(),l.updateCursor(),"zoom"!==o||t!==!0&&a&&i&&"image"===f.type&&!f.hasError&&(c=l.getThumbPos(f))||(o="fade"),"zoom"===o?(n.fancybox.stop(a),r=n.fancybox.getTranslate(a),r.width=r.width*r.scaleX,r.height=r.height*r.scaleY,s=f.opts.zoomOpacity,"auto"==s&&(s=Math.abs(f.width/f.height-c.width/c.height)>.1),s&&(c.opacity=0),r.scaleX=r.width/c.width,r.scaleY=r.height/c.height,r.width=c.width,r.height=c.height,n.fancybox.setTranslate(f.$content,r),n.fancybox.animate(f.$content,c,i,h),!0):(o&&i?t===!0?setTimeout(h,i):n.fancybox.animate(f.$slide.removeClass("fancybox-slide--current"),"fancybox-animated fancybox-slide--previous fancybox-fx-"+o,i,h):h(),!0)))},cleanUp:function(t){var e,o=this;o.current.$slide.trigger("onReset"),o.$refs.container.empty().remove(),o.trigger("afterClose",t),o.$lastFocus&&o.current.opts.backFocus&&o.$lastFocus.focus(),o.current=null,e=n.fancybox.getInstance(),e?e.activate():(s.scrollTop(o.scrollTop).scrollLeft(o.scrollLeft),n("html").removeClass("fancybox-enabled"),n("#fancybox-style-noscroll").remove())},trigger:function(t,e){var o,i=Array.prototype.slice.call(arguments,1),a=this,s=e&&e.opts?e:a.current;return s?i.unshift(s):s=a,i.unshift(a),n.isFunction(s.opts[t])&&(o=s.opts[t].apply(s,i)),o===!1?o:void("afterClose"===t?r.trigger(t+".fb",i):a.$refs.container.trigger(t+".fb",i))},updateControls:function(t){var e=this,o=e.current,i=o.index,a=o.opts,s=a.caption,r=e.$refs.caption;o.$slide.trigger("refresh"),e.$caption=s&&s.length?r.html(s):null,e.isHiddenControls||e.showControls(),n("[data-fancybox-count]").html(e.group.length),n("[data-fancybox-index]").html(i+1),n("[data-fancybox-prev]").prop("disabled",!a.loop&&i<=0),n("[data-fancybox-next]").prop("disabled",!a.loop&&i>=e.group.length-1)},hideControls:function(){this.isHiddenControls=!0,this.$refs.container.removeClass("fancybox-show-infobar fancybox-show-toolbar fancybox-show-caption fancybox-show-nav")},showControls:function(){var t=this,e=t.current?t.current.opts:t.opts,n=t.$refs.container;t.isHiddenControls=!1,t.idleSecondsCounter=0,n.toggleClass("fancybox-show-toolbar",!(!e.toolbar||!e.buttons)).toggleClass("fancybox-show-infobar",!!(e.infobar&&t.group.length>1)).toggleClass("fancybox-show-nav",!!(e.arrows&&t.group.length>1)).toggleClass("fancybox-is-modal",!!e.modal),t.$caption?n.addClass("fancybox-show-caption "):n.removeClass("fancybox-show-caption")},toggleControls:function(){this.isHiddenControls?this.showControls():this.hideControls()}}),n.fancybox={version:"3.1.28",defaults:a,getInstance:function(t){var e=n('.fancybox-container:not(".fancybox-is-closing"):first').data("FancyBox"),o=Array.prototype.slice.call(arguments,1);return e instanceof h&&("string"===n.type(t)?e[t].apply(e,o):"function"===n.type(t)&&t.apply(e,o),e)},open:function(t,e,n){return new h(t,e,n)},close:function(t){var e=this.getInstance();e&&(e.close(),t===!0&&this.close())},destroy:function(){this.close(!0),r.off("click.fb-start")},isMobile:e.createTouch!==o&&/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),use3d:function(){var n=e.createElement("div");return t.getComputedStyle&&t.getComputedStyle(n).getPropertyValue("transform")&&!(e.documentMode&&e.documentMode<11)}(),getTranslate:function(t){var e;if(!t||!t.length)return!1;if(e=t.eq(0).css("transform"),e&&e.indexOf("matrix")!==-1?(e=e.split("(")[1],e=e.split(")")[0],e=e.split(",")):e=[],e.length)e=e.length>10?[e[13],e[12],e[0],e[5]]:[e[5],e[4],e[0],e[3]],e=e.map(parseFloat);else{e=[0,0,1,1];var n=/\.*translate\((.*)px,(.*)px\)/i,o=n.exec(t.eq(0).attr("style"));o&&(e[0]=parseFloat(o[2]),e[1]=parseFloat(o[1]))}return{top:e[0],left:e[1],scaleX:e[2],scaleY:e[3],opacity:parseFloat(t.css("opacity")),width:t.width(),height:t.height()}},setTranslate:function(t,e){var n="",i={};if(t&&e)return e.left===o&&e.top===o||(n=(e.left===o?t.position().left:e.left)+"px, "+(e.top===o?t.position().top:e.top)+"px",n=this.use3d?"translate3d("+n+", 0px)":"translate("+n+")"),e.scaleX!==o&&e.scaleY!==o&&(n=(n.length?n+" ":"")+"scale("+e.scaleX+", "+e.scaleY+")"),n.length&&(i.transform=n),e.opacity!==o&&(i.opacity=e.opacity),e.width!==o&&(i.width=e.width),e.height!==o&&(i.height=e.height),t.css(i)},animate:function(t,e,i,a,s){var r=d||"transitionend";n.isFunction(i)&&(a=i,i=null),n.isPlainObject(e)||t.removeAttr("style"),t.on(r,function(i){(!i||!i.originalEvent||t.is(i.originalEvent.target)&&"z-index"!=i.originalEvent.propertyName)&&(t.off(r),n.isPlainObject(e)?e.scaleX!==o&&e.scaleY!==o&&(t.css("transition-duration","0ms"),e.width=Math.round(t.width()*e.scaleX),e.height=Math.round(t.height()*e.scaleY),e.scaleX=1,e.scaleY=1,n.fancybox.setTranslate(t,e)):s!==!0&&t.removeClass(e),n.isFunction(a)&&a(i))}),n.isNumeric(i)&&t.css("transition-duration",i+"ms"),n.isPlainObject(e)?n.fancybox.setTranslate(t,e):t.addClass(e),t.data("timer",setTimeout(function(){t.trigger("transitionend")},i+16))},stop:function(t){clearTimeout(t.data("timer")),t.off(d)}},n.fn.fancybox=function(t){var e;return t=t||{},e=t.selector||!1,e?n("body").off("click.fb-start",e).on("click.fb-start",e,{options:t},i):this.off("click.fb-start").on("click.fb-start",{items:this,options:t},i),this},r.on("click.fb-start","[data-fancybox]",i)}}(window,document,window.jQuery||jQuery),function(t){"use strict";var e=function(e,n,o){if(e)return o=o||"","object"===t.type(o)&&(o=t.param(o,!0)),t.each(n,function(t,n){e=e.replace("$"+t,n||"")}),o.length&&(e+=(e.indexOf("?")>0?"&":"?")+o),e},n={youtube:{matcher:/(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(watch\?(.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*))(.*)/i,params:{autoplay:1,autohide:1,fs:1,rel:0,hd:1,wmode:"transparent",enablejsapi:1,html5:1},paramPlace:8,type:"iframe",url:"//www.youtube.com/embed/$4",thumb:"//img.youtube.com/vi/$4/hqdefault.jpg"},vimeo:{matcher:/^.+vimeo.com\/(.*\/)?([\d]+)(.*)?/,params:{autoplay:1,hd:1,show_title:1,show_byline:1,show_portrait:0,fullscreen:1,api:1},paramPlace:3,type:"iframe",url:"//player.vimeo.com/video/$2"},metacafe:{matcher:/metacafe.com\/watch\/(\d+)\/(.*)?/,type:"iframe",url:"//www.metacafe.com/embed/$1/?ap=1"},dailymotion:{matcher:/dailymotion.com\/video\/(.*)\/?(.*)/,params:{additionalInfos:0,autoStart:1},type:"iframe",url:"//www.dailymotion.com/embed/video/$1"},vine:{matcher:/vine.co\/v\/([a-zA-Z0-9\?\=\-]+)/,type:"iframe",url:"//vine.co/v/$1/embed/simple"},instagram:{matcher:/(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,type:"image",url:"//$1/p/$2/media/?size=l"},gmap_place:{matcher:/(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(((maps\/(place\/(.*)\/)?\@(.*),(\d+.?\d+?)z))|(\?ll=))(.*)?/i,type:"iframe",url:function(t){return"//maps.google."+t[2]+"/?ll="+(t[9]?t[9]+"&z="+Math.floor(t[10])+(t[12]?t[12].replace(/^\//,"&"):""):t[12])+"&output="+(t[12]&&t[12].indexOf("layer=c")>0?"svembed":"embed")}},gmap_search:{matcher:/(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(maps\/search\/)(.*)/i,type:"iframe",url:function(t){return"//maps.google."+t[2]+"/maps?q="+t[5].replace("query=","q=").replace("api=1","")+"&output=embed"}}};t(document).on("onInit.fb",function(o,i){t.each(i.group,function(o,i){var a,s,r,c,l,u,d,f=i.src||"",h=!1;i.type||(a=t.extend(!0,{},n,i.opts.media),t.each(a,function(n,o){if(r=f.match(o.matcher),u={},d=n,r){if(h=o.type,o.paramPlace&&r[o.paramPlace]){l=r[o.paramPlace],"?"==l[0]&&(l=l.substring(1)),l=l.split("&");for(var a=0;a<l.length;++a){var p=l[a].split("=",2);2==p.length&&(u[p[0]]=decodeURIComponent(p[1].replace(/\+/g," ")))}}return c=t.extend(!0,{},o.params,i.opts[n],u),f="function"===t.type(o.url)?o.url.call(this,r,c,i):e(o.url,r,c),s="function"===t.type(o.thumb)?o.thumb.call(this,r,c,i):e(o.thumb,r),"vimeo"===d&&(f=f.replace("&%23","#")),!1}}),h?(i.src=f,i.type=h,i.opts.thumb||i.opts.$thumb&&i.opts.$thumb.length||(i.opts.thumb=s),"iframe"===h&&(t.extend(!0,i.opts,{
iframe:{preload:!1,attr:{scrolling:"no"}}}),i.contentProvider=d,i.opts.slideClass+=" fancybox-slide--"+("gmap_place"==d||"gmap_search"==d?"map":"video"))):i.type="image")})})}(window.jQuery),function(t,e,n){"use strict";var o=function(){return t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||function(e){return t.setTimeout(e,1e3/60)}}(),i=function(){return t.cancelAnimationFrame||t.webkitCancelAnimationFrame||t.mozCancelAnimationFrame||t.oCancelAnimationFrame||function(e){t.clearTimeout(e)}}(),a=function(e){var n=[];e=e.originalEvent||e||t.e,e=e.touches&&e.touches.length?e.touches:e.changedTouches&&e.changedTouches.length?e.changedTouches:[e];for(var o in e)e[o].pageX?n.push({x:e[o].pageX,y:e[o].pageY}):e[o].clientX&&n.push({x:e[o].clientX,y:e[o].clientY});return n},s=function(t,e,n){return e&&t?"x"===n?t.x-e.x:"y"===n?t.y-e.y:Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2)):0},r=function(t){if(t.is("a,button,input,select,textarea,label")||n.isFunction(t.get(0).onclick)||t.data("selectable"))return!0;for(var e=0,o=t[0].attributes,i=o.length;e<i;e++)if("data-fancybox-"===o[e].nodeName.substr(0,14))return!0;return!1},c=function(e){var n=t.getComputedStyle(e)["overflow-y"],o=t.getComputedStyle(e)["overflow-x"],i=("scroll"===n||"auto"===n)&&e.scrollHeight>e.clientHeight,a=("scroll"===o||"auto"===o)&&e.scrollWidth>e.clientWidth;return i||a},l=function(t){for(var e=!1;;){if(e=c(t.get(0)))break;if(t=t.parent(),!t.length||t.hasClass("fancybox-stage")||t.is("body"))break}return e},u=function(t){var e=this;e.instance=t,e.$bg=t.$refs.bg,e.$stage=t.$refs.stage,e.$container=t.$refs.container,e.destroy(),e.$container.on("touchstart.fb.touch mousedown.fb.touch",n.proxy(e,"ontouchstart"))};u.prototype.destroy=function(){this.$container.off(".fb.touch")},u.prototype.ontouchstart=function(o){var i=this,c=n(o.target),u=i.instance,d=u.current,f=d.$content,h="touchstart"==o.type;if(h&&i.$container.off("mousedown.fb.touch"),!d||i.instance.isAnimating||i.instance.isClosing)return o.stopPropagation(),void o.preventDefault();if((!o.originalEvent||2!=o.originalEvent.button)&&c.length&&!r(c)&&!r(c.parent())&&!(o.originalEvent.clientX>c[0].clientWidth+c.offset().left)&&(i.startPoints=a(o),i.startPoints&&!(i.startPoints.length>1&&u.isSliding))){if(i.$target=c,i.$content=f,i.canTap=!0,n(e).off(".fb.touch"),n(e).on(h?"touchend.fb.touch touchcancel.fb.touch":"mouseup.fb.touch mouseleave.fb.touch",n.proxy(i,"ontouchend")),n(e).on(h?"touchmove.fb.touch":"mousemove.fb.touch",n.proxy(i,"ontouchmove")),!u.current.opts.touch&&!u.canPan()||!c.is(i.$stage)&&!i.$stage.find(c).length)return void(c.is("img")&&o.preventDefault());o.stopPropagation(),n.fancybox.isMobile&&(l(i.$target)||l(i.$target.parent()))||o.preventDefault(),i.canvasWidth=Math.round(d.$slide[0].clientWidth),i.canvasHeight=Math.round(d.$slide[0].clientHeight),i.startTime=(new Date).getTime(),i.distanceX=i.distanceY=i.distance=0,i.isPanning=!1,i.isSwiping=!1,i.isZooming=!1,i.sliderStartPos=i.sliderLastPos||{top:0,left:0},i.contentStartPos=n.fancybox.getTranslate(i.$content),i.contentLastPos=null,1!==i.startPoints.length||i.isZooming||(i.canTap=!u.isSliding,"image"===d.type&&(i.contentStartPos.width>i.canvasWidth+1||i.contentStartPos.height>i.canvasHeight+1)?(n.fancybox.stop(i.$content),i.$content.css("transition-duration","0ms"),i.isPanning=!0):i.isSwiping=!0,i.$container.addClass("fancybox-controls--isGrabbing")),2!==i.startPoints.length||u.isAnimating||d.hasError||"image"!==d.type||!d.isLoaded&&!d.$ghost||(i.isZooming=!0,i.isSwiping=!1,i.isPanning=!1,n.fancybox.stop(i.$content),i.$content.css("transition-duration","0ms"),i.centerPointStartX=.5*(i.startPoints[0].x+i.startPoints[1].x)-n(t).scrollLeft(),i.centerPointStartY=.5*(i.startPoints[0].y+i.startPoints[1].y)-n(t).scrollTop(),i.percentageOfImageAtPinchPointX=(i.centerPointStartX-i.contentStartPos.left)/i.contentStartPos.width,i.percentageOfImageAtPinchPointY=(i.centerPointStartY-i.contentStartPos.top)/i.contentStartPos.height,i.startDistanceBetweenFingers=s(i.startPoints[0],i.startPoints[1]))}},u.prototype.ontouchmove=function(t){var e=this;if(e.newPoints=a(t),n.fancybox.isMobile&&(l(e.$target)||l(e.$target.parent())))return t.stopPropagation(),void(e.canTap=!1);if((e.instance.current.opts.touch||e.instance.canPan())&&e.newPoints&&e.newPoints.length&&(e.distanceX=s(e.newPoints[0],e.startPoints[0],"x"),e.distanceY=s(e.newPoints[0],e.startPoints[0],"y"),e.distance=s(e.newPoints[0],e.startPoints[0]),e.distance>0)){if(!e.$target.is(e.$stage)&&!e.$stage.find(e.$target).length)return;t.stopPropagation(),t.preventDefault(),e.isSwiping?e.onSwipe():e.isPanning?e.onPan():e.isZooming&&e.onZoom()}},u.prototype.onSwipe=function(){var e,a=this,s=a.isSwiping,r=a.sliderStartPos.left||0;s===!0?Math.abs(a.distance)>10&&(a.canTap=!1,a.instance.group.length<2&&a.instance.opts.touch.vertical?a.isSwiping="y":a.instance.isSliding||a.instance.opts.touch.vertical===!1||"auto"===a.instance.opts.touch.vertical&&n(t).width()>800?a.isSwiping="x":(e=Math.abs(180*Math.atan2(a.distanceY,a.distanceX)/Math.PI),a.isSwiping=e>45&&e<135?"y":"x"),a.instance.isSliding=a.isSwiping,a.startPoints=a.newPoints,n.each(a.instance.slides,function(t,e){n.fancybox.stop(e.$slide),e.$slide.css("transition-duration","0ms"),e.inTransition=!1,e.pos===a.instance.current.pos&&(a.sliderStartPos.left=n.fancybox.getTranslate(e.$slide).left)}),a.instance.SlideShow&&a.instance.SlideShow.isActive&&a.instance.SlideShow.stop()):("x"==s&&(a.distanceX>0&&(a.instance.group.length<2||0===a.instance.current.index&&!a.instance.current.opts.loop)?r+=Math.pow(a.distanceX,.8):a.distanceX<0&&(a.instance.group.length<2||a.instance.current.index===a.instance.group.length-1&&!a.instance.current.opts.loop)?r-=Math.pow(-a.distanceX,.8):r+=a.distanceX),a.sliderLastPos={top:"x"==s?0:a.sliderStartPos.top+a.distanceY,left:r},a.requestId&&(i(a.requestId),a.requestId=null),a.requestId=o(function(){a.sliderLastPos&&(n.each(a.instance.slides,function(t,e){var o=e.pos-a.instance.currPos;n.fancybox.setTranslate(e.$slide,{top:a.sliderLastPos.top,left:a.sliderLastPos.left+o*a.canvasWidth+o*e.opts.gutter})}),a.$container.addClass("fancybox-is-sliding"))}))},u.prototype.onPan=function(){var t,e,a,s=this;s.canTap=!1,t=s.contentStartPos.width>s.canvasWidth?s.contentStartPos.left+s.distanceX:s.contentStartPos.left,e=s.contentStartPos.top+s.distanceY,a=s.limitMovement(t,e,s.contentStartPos.width,s.contentStartPos.height),a.scaleX=s.contentStartPos.scaleX,a.scaleY=s.contentStartPos.scaleY,s.contentLastPos=a,s.requestId&&(i(s.requestId),s.requestId=null),s.requestId=o(function(){n.fancybox.setTranslate(s.$content,s.contentLastPos)})},u.prototype.limitMovement=function(t,e,n,o){var i,a,s,r,c=this,l=c.canvasWidth,u=c.canvasHeight,d=c.contentStartPos.left,f=c.contentStartPos.top,h=c.distanceX,p=c.distanceY;return i=Math.max(0,.5*l-.5*n),a=Math.max(0,.5*u-.5*o),s=Math.min(l-n,.5*l-.5*n),r=Math.min(u-o,.5*u-.5*o),n>l&&(h>0&&t>i&&(t=i-1+Math.pow(-i+d+h,.8)||0),h<0&&t<s&&(t=s+1-Math.pow(s-d-h,.8)||0)),o>u&&(p>0&&e>a&&(e=a-1+Math.pow(-a+f+p,.8)||0),p<0&&e<r&&(e=r+1-Math.pow(r-f-p,.8)||0)),{top:e,left:t}},u.prototype.limitPosition=function(t,e,n,o){var i=this,a=i.canvasWidth,s=i.canvasHeight;return n>a?(t=t>0?0:t,t=t<a-n?a-n:t):t=Math.max(0,a/2-n/2),o>s?(e=e>0?0:e,e=e<s-o?s-o:e):e=Math.max(0,s/2-o/2),{top:e,left:t}},u.prototype.onZoom=function(){var e=this,a=e.contentStartPos.width,r=e.contentStartPos.height,c=e.contentStartPos.left,l=e.contentStartPos.top,u=s(e.newPoints[0],e.newPoints[1]),d=u/e.startDistanceBetweenFingers,f=Math.floor(a*d),h=Math.floor(r*d),p=(a-f)*e.percentageOfImageAtPinchPointX,g=(r-h)*e.percentageOfImageAtPinchPointY,b=(e.newPoints[0].x+e.newPoints[1].x)/2-n(t).scrollLeft(),m=(e.newPoints[0].y+e.newPoints[1].y)/2-n(t).scrollTop(),y=b-e.centerPointStartX,v=m-e.centerPointStartY,x=c+(p+y),w=l+(g+v),$={top:w,left:x,scaleX:e.contentStartPos.scaleX*d,scaleY:e.contentStartPos.scaleY*d};e.canTap=!1,e.newWidth=f,e.newHeight=h,e.contentLastPos=$,e.requestId&&(i(e.requestId),e.requestId=null),e.requestId=o(function(){n.fancybox.setTranslate(e.$content,e.contentLastPos)})},u.prototype.ontouchend=function(t){var o=this,s=Math.max((new Date).getTime()-o.startTime,1),r=o.isSwiping,c=o.isPanning,l=o.isZooming;return o.endPoints=a(t),o.$container.removeClass("fancybox-controls--isGrabbing"),n(e).off(".fb.touch"),o.requestId&&(i(o.requestId),o.requestId=null),o.isSwiping=!1,o.isPanning=!1,o.isZooming=!1,o.canTap?o.onTap(t):(o.speed=366,o.velocityX=o.distanceX/s*.5,o.velocityY=o.distanceY/s*.5,o.speedX=Math.max(.5*o.speed,Math.min(1.5*o.speed,1/Math.abs(o.velocityX)*o.speed)),void(c?o.endPanning():l?o.endZooming():o.endSwiping(r)))},u.prototype.endSwiping=function(t){var e=this,o=!1;e.instance.isSliding=!1,e.sliderLastPos=null,"y"==t&&Math.abs(e.distanceY)>50?(n.fancybox.animate(e.instance.current.$slide,{top:e.sliderStartPos.top+e.distanceY+150*e.velocityY,opacity:0},150),o=e.instance.close(!0,300)):"x"==t&&e.distanceX>50&&e.instance.group.length>1?o=e.instance.previous(e.speedX):"x"==t&&e.distanceX<-50&&e.instance.group.length>1&&(o=e.instance.next(e.speedX)),o!==!1||"x"!=t&&"y"!=t||e.instance.jumpTo(e.instance.current.index,150),e.$container.removeClass("fancybox-is-sliding")},u.prototype.endPanning=function(){var t,e,o,i=this;i.contentLastPos&&(i.instance.current.opts.touch.momentum===!1?(t=i.contentLastPos.left,e=i.contentLastPos.top):(t=i.contentLastPos.left+i.velocityX*i.speed,e=i.contentLastPos.top+i.velocityY*i.speed),o=i.limitPosition(t,e,i.contentStartPos.width,i.contentStartPos.height),o.width=i.contentStartPos.width,o.height=i.contentStartPos.height,n.fancybox.animate(i.$content,o,330))},u.prototype.endZooming=function(){var t,e,o,i,a=this,s=a.instance.current,r=a.newWidth,c=a.newHeight;a.contentLastPos&&(t=a.contentLastPos.left,e=a.contentLastPos.top,i={top:e,left:t,width:r,height:c,scaleX:1,scaleY:1},n.fancybox.setTranslate(a.$content,i),r<a.canvasWidth&&c<a.canvasHeight?a.instance.scaleToFit(150):r>s.width||c>s.height?a.instance.scaleToActual(a.centerPointStartX,a.centerPointStartY,150):(o=a.limitPosition(t,e,r,c),n.fancybox.setTranslate(a.content,n.fancybox.getTranslate(a.$content)),n.fancybox.animate(a.$content,o,150)))},u.prototype.onTap=function(t){var e,o=this,i=n(t.target),s=o.instance,r=s.current,c=t&&a(t)||o.startPoints,l=c[0]?c[0].x-o.$stage.offset().left:0,u=c[0]?c[0].y-o.$stage.offset().top:0,d=function(e){var i=r.opts[e];if(n.isFunction(i)&&(i=i.apply(s,[r,t])),i)switch(i){case"close":s.close(o.startEvent);break;case"toggleControls":s.toggleControls(!0);break;case"next":s.next();break;case"nextOrClose":s.group.length>1?s.next():s.close(o.startEvent);break;case"zoom":"image"==r.type&&(r.isLoaded||r.$ghost)&&(s.canPan()?s.scaleToFit():s.isScaledDown()?s.scaleToActual(l,u):s.group.length<2&&s.close(o.startEvent))}};if(!(t.originalEvent&&2==t.originalEvent.button||s.isSliding||l>i[0].clientWidth+i.offset().left)){if(i.is(".fancybox-bg,.fancybox-inner,.fancybox-outer,.fancybox-container"))e="Outside";else if(i.is(".fancybox-slide"))e="Slide";else{if(!s.current.$content||!s.current.$content.has(t.target).length)return;e="Content"}if(o.tapped){if(clearTimeout(o.tapped),o.tapped=null,Math.abs(l-o.tapX)>50||Math.abs(u-o.tapY)>50||s.isSliding)return this;d("dblclick"+e)}else o.tapX=l,o.tapY=u,r.opts["dblclick"+e]&&r.opts["dblclick"+e]!==r.opts["click"+e]?o.tapped=setTimeout(function(){o.tapped=null,d("click"+e)},300):d("click"+e);return this}},n(e).on("onActivate.fb",function(t,e){e&&!e.Guestures&&(e.Guestures=new u(e))}),n(e).on("beforeClose.fb",function(t,e){e&&e.Guestures&&e.Guestures.destroy()})}(window,document,window.jQuery),function(t,e){"use strict";var n=function(t){this.instance=t,this.init()};e.extend(n.prototype,{timer:null,isActive:!1,$button:null,speed:3e3,init:function(){var t=this;t.$button=t.instance.$refs.toolbar.find("[data-fancybox-play]").on("click",function(){t.toggle()}),(t.instance.group.length<2||!t.instance.group[t.instance.currIndex].opts.slideShow)&&t.$button.hide()},set:function(){var t=this;t.instance&&t.instance.current&&(t.instance.current.opts.loop||t.instance.currIndex<t.instance.group.length-1)?t.timer=setTimeout(function(){t.instance.next()},t.instance.current.opts.slideShow.speed||t.speed):(t.stop(),t.instance.idleSecondsCounter=0,t.instance.showControls())},clear:function(){var t=this;clearTimeout(t.timer),t.timer=null},start:function(){var t=this,e=t.instance.current;t.instance&&e&&(e.opts.loop||e.index<t.instance.group.length-1)&&(t.isActive=!0,t.$button.attr("title",e.opts.i18n[e.opts.lang].PLAY_STOP).addClass("fancybox-button--pause"),e.isComplete&&t.set())},stop:function(){var t=this,e=t.instance.current;t.clear(),t.$button.attr("title",e.opts.i18n[e.opts.lang].PLAY_START).removeClass("fancybox-button--pause"),t.isActive=!1},toggle:function(){var t=this;t.isActive?t.stop():t.start()}}),e(t).on({"onInit.fb":function(t,e){e&&!e.SlideShow&&(e.SlideShow=new n(e))},"beforeShow.fb":function(t,e,n,o){var i=e&&e.SlideShow;o?i&&n.opts.slideShow.autoStart&&i.start():i&&i.isActive&&i.clear()},"afterShow.fb":function(t,e,n){var o=e&&e.SlideShow;o&&o.isActive&&o.set()},"afterKeydown.fb":function(n,o,i,a,s){var r=o&&o.SlideShow;!r||!i.opts.slideShow||80!==s&&32!==s||e(t.activeElement).is("button,a,input")||(a.preventDefault(),r.toggle())},"beforeClose.fb onDeactivate.fb":function(t,e){var n=e&&e.SlideShow;n&&n.stop()}}),e(t).on("visibilitychange",function(){var n=e.fancybox.getInstance(),o=n&&n.SlideShow;o&&o.isActive&&(t.hidden?o.clear():o.set())})}(document,window.jQuery),function(t,e){"use strict";var n=function(){var e,n,o,i=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],a={};for(n=0;n<i.length;n++)if(e=i[n],e&&e[1]in t){for(o=0;o<e.length;o++)a[i[0][o]]=e[o];return a}return!1}();if(!n)return void(e&&e.fancybox&&(e.fancybox.defaults.btnTpl.fullScreen=!1));var o={request:function(e){e=e||t.documentElement,e[n.requestFullscreen](e.ALLOW_KEYBOARD_INPUT)},exit:function(){t[n.exitFullscreen]()},toggle:function(e){e=e||t.documentElement,this.isFullscreen()?this.exit():this.request(e)},isFullscreen:function(){return Boolean(t[n.fullscreenElement])},enabled:function(){return Boolean(t[n.fullscreenEnabled])}};e(t).on({"onInit.fb":function(t,e){var n,i=e.$refs.toolbar.find("[data-fancybox-fullscreen]");e&&!e.FullScreen&&e.group[e.currIndex].opts.fullScreen?(n=e.$refs.container,n.on("click.fb-fullscreen","[data-fancybox-fullscreen]",function(t){t.stopPropagation(),t.preventDefault(),o.toggle(n[0])}),e.opts.fullScreen&&e.opts.fullScreen.autoStart===!0&&o.request(n[0]),e.FullScreen=o):i.hide()},"afterKeydown.fb":function(t,e,n,o,i){e&&e.FullScreen&&70===i&&(o.preventDefault(),e.FullScreen.toggle(e.$refs.container[0]))},"beforeClose.fb":function(t){t&&t.FullScreen&&o.exit()}}),e(t).on(n.fullscreenchange,function(){var t=e.fancybox.getInstance();t.current&&"image"===t.current.type&&t.isAnimating&&(t.current.$content.css("transition","none"),t.isAnimating=!1,t.update(!0,!0,0)),t.trigger("onFullscreenChange",o.isFullscreen())})}(document,window.jQuery),function(t,e){"use strict";var n=function(t){this.instance=t,this.init()};e.extend(n.prototype,{$button:null,$grid:null,$list:null,isVisible:!1,init:function(){var t=this,e=t.instance.group[0],n=t.instance.group[1];t.$button=t.instance.$refs.toolbar.find("[data-fancybox-thumbs]"),t.instance.group.length>1&&t.instance.group[t.instance.currIndex].opts.thumbs&&("image"==e.type||e.opts.thumb||e.opts.$thumb)&&("image"==n.type||n.opts.thumb||n.opts.$thumb)?(t.$button.on("click",function(){t.toggle()}),t.isActive=!0):(t.$button.hide(),t.isActive=!1)},create:function(){var t,n,o=this.instance;this.$grid=e('<div class="fancybox-thumbs"></div>').appendTo(o.$refs.container),t="<ul>",e.each(o.group,function(e,o){n=o.opts.thumb||(o.opts.$thumb?o.opts.$thumb.attr("src"):null),n||"image"!==o.type||(n=o.src),n&&n.length&&(t+='<li data-index="'+e+'"  tabindex="0" class="fancybox-thumbs-loading"><img data-src="'+n+'" /></li>')}),t+="</ul>",this.$list=e(t).appendTo(this.$grid).on("click","li",function(){o.jumpTo(e(this).data("index"))}),this.$list.find("img").hide().one("load",function(){var t,n,o,i,a=e(this).parent().removeClass("fancybox-thumbs-loading"),s=a.outerWidth(),r=a.outerHeight();t=this.naturalWidth||this.width,n=this.naturalHeight||this.height,o=t/s,i=n/r,o>=1&&i>=1&&(o>i?(t/=i,n=r):(t=s,n/=o)),e(this).css({width:Math.floor(t),height:Math.floor(n),"margin-top":Math.min(0,Math.floor(.3*r-.3*n)),"margin-left":Math.min(0,Math.floor(.5*s-.5*t))}).show()}).each(function(){this.src=e(this).data("src")})},focus:function(){this.instance.current&&this.$list.children().removeClass("fancybox-thumbs-active").filter('[data-index="'+this.instance.current.index+'"]').addClass("fancybox-thumbs-active").focus()},close:function(){this.$grid.hide()},update:function(){this.instance.$refs.container.toggleClass("fancybox-show-thumbs",this.isVisible),this.isVisible?(this.$grid||this.create(),this.instance.trigger("onThumbsShow"),this.focus()):this.$grid&&this.instance.trigger("onThumbsHide"),this.instance.update()},hide:function(){this.isVisible=!1,this.update()},show:function(){this.isVisible=!0,this.update()},toggle:function(){this.isVisible=!this.isVisible,this.update()}}),e(t).on({"onInit.fb":function(t,e){e&&!e.Thumbs&&(e.Thumbs=new n(e))},"beforeShow.fb":function(t,e,n,o){var i=e&&e.Thumbs;if(i&&i.isActive){if(n.modal)return i.$button.hide(),void i.hide();o&&n.opts.thumbs.autoStart===!0&&i.show(),i.isVisible&&i.focus()}},"afterKeydown.fb":function(t,e,n,o,i){var a=e&&e.Thumbs;a&&a.isActive&&71===i&&(o.preventDefault(),a.toggle())},"beforeClose.fb":function(t,e){var n=e&&e.Thumbs;n&&n.isVisible&&e.opts.thumbs.hideOnClose!==!1&&n.close()}})}(document,window.jQuery),function(t,e,n){"use strict";function o(){var t=e.location.hash.substr(1),n=t.split("-"),o=n.length>1&&/^\+?\d+$/.test(n[n.length-1])?parseInt(n.pop(-1),10)||1:1,i=n.join("-");return o<1&&(o=1),{hash:t,index:o,gallery:i}}function i(t){var e;""!==t.gallery&&(e=n("[data-fancybox='"+n.escapeSelector(t.gallery)+"']").eq(t.index-1),e.length||(e=n("#"+n.escapeSelector(t.gallery))),e.length&&(s=!1,e.trigger("click")))}function a(t){var e;return!!t&&(e=t.current?t.current.opts:t.opts,e.hash||(e.$orig?e.$orig.data("fancybox"):""))}n.escapeSelector||(n.escapeSelector=function(t){var e=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g,n=function(t,e){return e?"\0"===t?"�":t.slice(0,-1)+"\\"+t.charCodeAt(t.length-1).toString(16)+" ":"\\"+t};return(t+"").replace(e,n)});var s=!0,r=null,c=null;n(function(){setTimeout(function(){n.fancybox.defaults.hash!==!1&&(n(t).on({"onInit.fb":function(t,e){var n,i;e.group[e.currIndex].opts.hash!==!1&&(n=o(),i=a(e),i&&n.gallery&&i==n.gallery&&(e.currIndex=n.index-1))},"beforeShow.fb":function(n,o,i){var l;i&&i.opts.hash!==!1&&(l=a(o),l&&""!==l&&(e.location.hash.indexOf(l)<0&&(o.opts.origHash=e.location.hash),r=l+(o.group.length>1?"-"+(i.index+1):""),"replaceState"in e.history?(c&&clearTimeout(c),c=setTimeout(function(){e.history[s?"pushState":"replaceState"]({},t.title,e.location.pathname+e.location.search+"#"+r),c=null,s=!1},300)):e.location.hash=r))},"beforeClose.fb":function(o,i,s){var l,u;c&&clearTimeout(c),s.opts.hash!==!1&&(l=a(i),u=i&&i.opts.origHash?i.opts.origHash:"",l&&""!==l&&("replaceState"in history?e.history.replaceState({},t.title,e.location.pathname+e.location.search+u):(e.location.hash=u,n(e).scrollTop(i.scrollTop).scrollLeft(i.scrollLeft))),r=null)}}),n(e).on("hashchange.fb",function(){var t=o();n.fancybox.getInstance()?!r||r===t.gallery+"-"+t.index||1===t.index&&r==t.gallery||(r=null,n.fancybox.close()):""!==t.gallery&&i(t)}),i(o()))},50)})}(document,window,window.jQuery);

/*!
 * jQuery Validation Plugin v1.17.0
 *
 * https://jqueryvalidation.org/
 *
 * Copyright (c) 2017 Jörn Zaefferer
 * Released under the MIT license
 */

(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery"], factory );
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory( require( "jquery" ) );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

$.extend( $.fn, {

	// https://jqueryvalidation.org/validate/
	validate: function( options ) {

		// If nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// Check if a validator for this form was already created
		var validator = $.data( this[ 0 ], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[ 0 ] );
		$.data( this[ 0 ], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.on( "click.validate", ":submit", function( event ) {

				// Track the used submit button to properly handle scripted
				// submits later.
				validator.submitButton = event.currentTarget;

				// Allow suppressing validation by adding a cancel class to the submit button
				if ( $( this ).hasClass( "cancel" ) ) {
					validator.cancelSubmit = true;
				}

				// Allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
					validator.cancelSubmit = true;
				}
			} );

			// Validate the form on submit
			this.on( "submit.validate", function( event ) {
				if ( validator.settings.debug ) {

					// Prevent form submit to be able to see console output
					event.preventDefault();
				}
				function handle() {
					var hidden, result;

					// Insert a hidden input as a replacement for the missing submit button
					// The hidden input is inserted in two cases:
					//   - A user defined a `submitHandler`
					//   - There was a pending request due to `remote` method and `stopRequest()`
					//     was called to submit the form in case it's valid
					if ( validator.submitButton && ( validator.settings.submitHandler || validator.formSubmitted ) ) {
						hidden = $( "<input type='hidden'/>" )
							.attr( "name", validator.submitButton.name )
							.val( $( validator.submitButton ).val() )
							.appendTo( validator.currentForm );
					}

					if ( validator.settings.submitHandler ) {
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( hidden ) {

							// And clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						if ( result !== undefined ) {
							return result;
						}
						return false;
					}
					return true;
				}

				// Prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			} );
		}

		return validator;
	},

	// https://jqueryvalidation.org/valid/
	valid: function() {
		var valid, validator, errorList;

		if ( $( this[ 0 ] ).is( "form" ) ) {
			valid = this.validate().form();
		} else {
			errorList = [];
			valid = true;
			validator = $( this[ 0 ].form ).validate();
			this.each( function() {
				valid = validator.element( this ) && valid;
				if ( !valid ) {
					errorList = errorList.concat( validator.errorList );
				}
			} );
			validator.errorList = errorList;
		}
		return valid;
	},

	// https://jqueryvalidation.org/rules/
	rules: function( command, argument ) {
		var element = this[ 0 ],
			settings, staticRules, existingRules, data, param, filtered;

		// If nothing is selected, return empty object; can't chain anyway
		if ( element == null ) {
			return;
		}

		if ( !element.form && element.hasAttribute( "contenteditable" ) ) {
			element.form = this.closest( "form" )[ 0 ];
			element.name = this.attr( "name" );
		}

		if ( element.form == null ) {
			return;
		}

		if ( command ) {
			settings = $.data( element.form, "validator" ).settings;
			staticRules = settings.rules;
			existingRules = $.validator.staticRules( element );
			switch ( command ) {
			case "add":
				$.extend( existingRules, $.validator.normalizeRule( argument ) );

				// Remove messages from rules, but allow them to be set separately
				delete existingRules.messages;
				staticRules[ element.name ] = existingRules;
				if ( argument.messages ) {
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[ element.name ];
					return existingRules;
				}
				filtered = {};
				$.each( argument.split( /\s/ ), function( index, method ) {
					filtered[ method ] = existingRules[ method ];
					delete existingRules[ method ];
				} );
				return filtered;
			}
		}

		data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules( element ),
			$.validator.attributeRules( element ),
			$.validator.dataRules( element ),
			$.validator.staticRules( element )
		), element );

		// Make sure required is at front
		if ( data.required ) {
			param = data.required;
			delete data.required;
			data = $.extend( { required: param }, data );
		}

		// Make sure remote is at back
		if ( data.remote ) {
			param = data.remote;
			delete data.remote;
			data = $.extend( data, { remote: param } );
		}

		return data;
	}
} );

// Custom selectors
$.extend( $.expr.pseudos || $.expr[ ":" ], {		// '|| $.expr[ ":" ]' here enables backwards compatibility to jQuery 1.7. Can be removed when dropping jQ 1.7.x support

	// https://jqueryvalidation.org/blank-selector/
	blank: function( a ) {
		return !$.trim( "" + $( a ).val() );
	},

	// https://jqueryvalidation.org/filled-selector/
	filled: function( a ) {
		var val = $( a ).val();
		return val !== null && !!$.trim( "" + val );
	},

	// https://jqueryvalidation.org/unchecked-selector/
	unchecked: function( a ) {
		return !$( a ).prop( "checked" );
	}
} );

// Constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

// https://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray( arguments );
			args.unshift( source );
			return $.validator.format.apply( this, args );
		};
	}
	if ( params === undefined ) {
		return source;
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray( arguments ).slice( 1 );
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each( params, function( i, n ) {
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
			return n;
		} );
	} );
	return source;
};

$.extend( $.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		pendingClass: "pending",
		validClass: "valid",
		errorElement: "label",
		focusCleanup: false,
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element ) {
			this.lastActive = element;

			// Hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.hideThese( this.errorsFor( element ) );
			}
		},
		onfocusout: function( element ) {
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
				this.element( element );
			}
		},
		onkeyup: function( element, event ) {

			// Avoid revalidate the field when pressing one of the following keys
			// Shift       => 16
			// Ctrl        => 17
			// Alt         => 18
			// Caps lock   => 20
			// End         => 35
			// Home        => 36
			// Left arrow  => 37
			// Up arrow    => 38
			// Right arrow => 39
			// Down arrow  => 40
			// Insert      => 45
			// Num lock    => 144
			// AltGr key   => 225
			var excludedKeys = [
				16, 17, 18, 20, 35, 36, 37,
				38, 39, 40, 45, 144, 225
			];

			if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
				return;
			} else if ( element.name in this.submitted || element.name in this.invalid ) {
				this.element( element );
			}
		},
		onclick: function( element ) {

			// Click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element( element );

			// Or option elements, check parent select in that case
			} else if ( element.parentNode.name in this.submitted ) {
				this.element( element.parentNode );
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
			} else {
				$( element ).addClass( errorClass ).removeClass( validClass );
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
			} else {
				$( element ).removeClass( errorClass ).addClass( validClass );
			}
		}
	},

	// https://jqueryvalidation.org/jQuery.validator.setDefaults/
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format( "Please enter no more than {0} characters." ),
		minlength: $.validator.format( "Please enter at least {0} characters." ),
		rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
		range: $.validator.format( "Please enter a value between {0} and {1}." ),
		max: $.validator.format( "Please enter a value less than or equal to {0}." ),
		min: $.validator.format( "Please enter a value greater than or equal to {0}." ),
		step: $.validator.format( "Please enter a multiple of {0}." )
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $( this.settings.errorLabelContainer );
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = ( this.groups = {} ),
				rules;
			$.each( this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split( /\s/ );
				}
				$.each( value, function( index, name ) {
					groups[ name ] = key;
				} );
			} );
			rules = this.settings.rules;
			$.each( rules, function( key, value ) {
				rules[ key ] = $.validator.normalizeRule( value );
			} );

			function delegate( event ) {

				// Set form expando on contenteditable
				if ( !this.form && this.hasAttribute( "contenteditable" ) ) {
					this.form = $( this ).closest( "form" )[ 0 ];
					this.name = $( this ).attr( "name" );
				}

				var validator = $.data( this.form, "validator" ),
					eventType = "on" + event.type.replace( /^validate/, "" ),
					settings = validator.settings;
				if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
					settings[ eventType ].call( validator, this, event );
				}
			}

			$( this.currentForm )
				.on( "focusin.validate focusout.validate keyup.validate",
					":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
					"[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
					"[type='radio'], [type='checkbox'], [contenteditable], [type='button']", delegate )

				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );

			if ( this.settings.invalidHandler ) {
				$( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
			}
		},

		// https://jqueryvalidation.org/Validator.form/
		form: function() {
			this.checkForm();
			$.extend( this.submitted, this.errorMap );
			this.invalid = $.extend( {}, this.errorMap );
			if ( !this.valid() ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
				this.check( elements[ i ] );
			}
			return this.valid();
		},

		// https://jqueryvalidation.org/Validator.element/
		element: function( element ) {
			var cleanElement = this.clean( element ),
				checkElement = this.validationTargetFor( cleanElement ),
				v = this,
				result = true,
				rs, group;

			if ( checkElement === undefined ) {
				delete this.invalid[ cleanElement.name ];
			} else {
				this.prepareElement( checkElement );
				this.currentElements = $( checkElement );

				// If this element is grouped, then validate all group elements already
				// containing a value
				group = this.groups[ checkElement.name ];
				if ( group ) {
					$.each( this.groups, function( name, testgroup ) {
						if ( testgroup === group && name !== checkElement.name ) {
							cleanElement = v.validationTargetFor( v.clean( v.findByName( name ) ) );
							if ( cleanElement && cleanElement.name in v.invalid ) {
								v.currentElements.push( cleanElement );
								result = v.check( cleanElement ) && result;
							}
						}
					} );
				}

				rs = this.check( checkElement ) !== false;
				result = result && rs;
				if ( rs ) {
					this.invalid[ checkElement.name ] = false;
				} else {
					this.invalid[ checkElement.name ] = true;
				}

				if ( !this.numberOfInvalids() ) {

					// Hide error containers on last error
					this.toHide = this.toHide.add( this.containers );
				}
				this.showErrors();

				// Add aria-invalid status for screen readers
				$( element ).attr( "aria-invalid", !rs );
			}

			return result;
		},

		// https://jqueryvalidation.org/Validator.showErrors/
		showErrors: function( errors ) {
			if ( errors ) {
				var validator = this;

				// Add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = $.map( this.errorMap, function( message, name ) {
					return {
						message: message,
						element: validator.findByName( name )[ 0 ]
					};
				} );

				// Remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !( element.name in errors );
				} );
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// https://jqueryvalidation.org/Validator.resetForm/
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$( this.currentForm ).resetForm();
			}
			this.invalid = {};
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			var elements = this.elements()
				.removeData( "previousValue" )
				.removeAttr( "aria-invalid" );

			this.resetElements( elements );
		},

		resetElements: function( elements ) {
			var i;

			if ( this.settings.unhighlight ) {
				for ( i = 0; elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ],
						this.settings.errorClass, "" );
					this.findByName( elements[ i ].name ).removeClass( this.settings.validClass );
				}
			} else {
				elements
					.removeClass( this.settings.errorClass )
					.removeClass( this.settings.validClass );
			}
		},

		numberOfInvalids: function() {
			return this.objectLength( this.invalid );
		},

		objectLength: function( obj ) {
			/* jshint unused: false */
			var count = 0,
				i;
			for ( i in obj ) {

				// This check allows counting elements with empty error
				// message as invalid elements
				if ( obj[ i ] !== undefined && obj[ i ] !== null && obj[ i ] !== false ) {
					count++;
				}
			}
			return count;
		},

		hideErrors: function() {
			this.hideThese( this.toHide );
		},

		hideThese: function( errors ) {
			errors.not( this.containers ).text( "" );
			this.addWrapper( errors ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [] )
					.filter( ":visible" )
					.focus()

					// Manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );
				} catch ( e ) {

					// Ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep( this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			} ).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// Select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( "input, select, textarea, [contenteditable]" )
			.not( ":submit, :reset, :image, :disabled" )
			.not( this.settings.ignore )
			.filter( function() {
				var name = this.name || $( this ).attr( "name" ); // For contenteditable
				if ( !name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this );
				}

				// Set form expando on contenteditable
				if ( this.hasAttribute( "contenteditable" ) ) {
					this.form = $( this ).closest( "form" )[ 0 ];
					this.name = name;
				}

				// Select only the first element for each name, and only those with rules specified
				if ( name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
					return false;
				}

				rulesCache[ name ] = true;
				return true;
			} );
		},

		clean: function( selector ) {
			return $( selector )[ 0 ];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.split( " " ).join( "." );
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );
		},

		resetInternals: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $( [] );
			this.toHide = $( [] );
		},

		reset: function() {
			this.resetInternals();
			this.currentElements = $( [] );
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor( element );
		},

		elementValue: function( element ) {
			var $element = $( element ),
				type = element.type,
				val, idx;

			if ( type === "radio" || type === "checkbox" ) {
				return this.findByName( element.name ).filter( ":checked" ).val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? "NaN" : $element.val();
			}

			if ( element.hasAttribute( "contenteditable" ) ) {
				val = $element.text();
			} else {
				val = $element.val();
			}

			if ( type === "file" ) {

				// Modern browser (chrome & safari)
				if ( val.substr( 0, 12 ) === "C:\\fakepath\\" ) {
					return val.substr( 12 );
				}

				// Legacy browsers
				// Unix-based path
				idx = val.lastIndexOf( "/" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Windows-based path
				idx = val.lastIndexOf( "\\" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Just the file name
				return val;
			}

			if ( typeof val === "string" ) {
				return val.replace( /\r/g, "" );
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $( element ).rules(),
				rulesCount = $.map( rules, function( n, i ) {
					return i;
				} ).length,
				dependencyMismatch = false,
				val = this.elementValue( element ),
				result, method, rule, normalizer;

			// Prioritize the local normalizer defined for this element over the global one
			// if the former exists, otherwise user the global one in case it exists.
			if ( typeof rules.normalizer === "function" ) {
				normalizer = rules.normalizer;
			} else if (	typeof this.settings.normalizer === "function" ) {
				normalizer = this.settings.normalizer;
			}

			// If normalizer is defined, then call it to retreive the changed value instead
			// of using the real one.
			// Note that `this` in the normalizer is `element`.
			if ( normalizer ) {
				val = normalizer.call( element, val );

				if ( typeof val !== "string" ) {
					throw new TypeError( "The normalizer should return a string value." );
				}

				// Delete the normalizer from rules to avoid treating it as a pre-defined method.
				delete rules.normalizer;
			}

			for ( method in rules ) {
				rule = { method: method, parameters: rules[ method ] };
				try {
					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

					// If a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" && rulesCount === 1 ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor( element ) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch ( e ) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					if ( e instanceof TypeError ) {
						e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
					}

					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength( rules ) ) {
				this.successList.push( element );
			}
			return true;
		},

		// Return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		// return the generic message if present and no method specific message is present
		customDataMessage: function( element, method ) {
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
		},

		// Return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[ name ];
			return m && ( m.constructor === String ? m : m[ method ] );
		},

		// Return the first defined argument, allowing empty strings
		findDefined: function() {
			for ( var i = 0; i < arguments.length; i++ ) {
				if ( arguments[ i ] !== undefined ) {
					return arguments[ i ];
				}
			}
			return undefined;
		},

		// The second parameter 'rule' used to be a string, and extended to an object literal
		// of the following form:
		// rule = {
		//     method: "method name",
		//     parameters: "the given method parameters"
		// }
		//
		// The old behavior still supported, kept to maintain backward compatibility with
		// old code, and will be removed in the next major release.
		defaultMessage: function( element, rule ) {
			if ( typeof rule === "string" ) {
				rule = { method: rule };
			}

			var message = this.findDefined(
					this.customMessage( element.name, rule.method ),
					this.customDataMessage( element, rule.method ),

					// 'title' is never undefined, so handle empty string as undefined
					!this.settings.ignoreTitle && element.title || undefined,
					$.validator.messages[ rule.method ],
					"<strong>Warning: No message defined for " + element.name + "</strong>"
				),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call( this, rule.parameters, element );
			} else if ( theregex.test( message ) ) {
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
			}

			return message;
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule );

			this.errorList.push( {
				message: message,
				element: element,
				method: rule.method
			} );

			this.errorMap[ element.name ] = message;
			this.submitted[ element.name ] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements, error;
			for ( i = 0; this.errorList[ i ]; i++ ) {
				error = this.errorList[ i ];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[ i ]; i++ ) {
					this.showLabel( this.successList[ i ] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not( this.invalidElements() );
		},

		invalidElements: function() {
			return $( this.errorList ).map( function() {
				return this.element;
			} );
		},

		showLabel: function( element, message ) {
			var place, group, errorID, v,
				error = this.errorsFor( element ),
				elementID = this.idOrName( element ),
				describedBy = $( element ).attr( "aria-describedby" );

			if ( error.length ) {

				// Refresh error/success class
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );

				// Replace message on existing label
				error.html( message );
			} else {

				// Create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass )
					.html( message || "" );

				// Maintain reference to the element to be placed into the DOM
				place = error;
				if ( this.settings.wrapper ) {

					// Make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
				}
				if ( this.labelContainer.length ) {
					this.labelContainer.append( place );
				} else if ( this.settings.errorPlacement ) {
					this.settings.errorPlacement.call( this, place, $( element ) );
				} else {
					place.insertAfter( element );
				}

				// Link error back to the element
				if ( error.is( "label" ) ) {

					// If the error is a label, then associate using 'for'
					error.attr( "for", elementID );

					// If the element is not a child of an associated label, then it's necessary
					// to explicitly apply aria-describedby
				} else if ( error.parents( "label[for='" + this.escapeCssMeta( elementID ) + "']" ).length === 0 ) {
					errorID = error.attr( "id" );

					// Respect existing non-error aria-describedby
					if ( !describedBy ) {
						describedBy = errorID;
					} else if ( !describedBy.match( new RegExp( "\\b" + this.escapeCssMeta( errorID ) + "\\b" ) ) ) {

						// Add to end of list if not already present
						describedBy += " " + errorID;
					}
					$( element ).attr( "aria-describedby", describedBy );

					// If this element is grouped, then assign to all elements in the same group
					group = this.groups[ element.name ];
					if ( group ) {
						v = this;
						$.each( v.groups, function( name, testgroup ) {
							if ( testgroup === group ) {
								$( "[name='" + v.escapeCssMeta( name ) + "']", v.currentForm )
									.attr( "aria-describedby", error.attr( "id" ) );
							}
						} );
					}
				}
			}
			if ( !message && this.settings.success ) {
				error.text( "" );
				if ( typeof this.settings.success === "string" ) {
					error.addClass( this.settings.success );
				} else {
					this.settings.success( error, element );
				}
			}
			this.toShow = this.toShow.add( error );
		},

		errorsFor: function( element ) {
			var name = this.escapeCssMeta( this.idOrName( element ) ),
				describer = $( element ).attr( "aria-describedby" ),
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";

			// 'aria-describedby' should directly reference the error element
			if ( describer ) {
				selector = selector + ", #" + this.escapeCssMeta( describer )
					.replace( /\s+/g, ", #" );
			}

			return this
				.errors()
				.filter( selector );
		},

		// See https://api.jquery.com/category/selectors/, for CSS
		// meta-characters that should be escaped in order to be used with JQuery
		// as a literal part of a name/id or any selector.
		escapeCssMeta: function( string ) {
			return string.replace( /([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1" );
		},

		idOrName: function( element ) {
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
		},

		validationTargetFor: function( element ) {

			// If radio/checkbox, validate first element in group instead
			if ( this.checkable( element ) ) {
				element = this.findByName( element.name );
			}

			// Always apply ignore filter
			return $( element ).not( this.settings.ignore )[ 0 ];
		},

		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.currentForm ).find( "[name='" + this.escapeCssMeta( name ) + "']" );
		},

		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[ typeof param ] ? this.dependTypes[ typeof param ]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		},

		optional: function( element ) {
			var val = this.elementValue( element );
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[ element.name ] ) {
				this.pendingRequest++;
				$( element ).addClass( this.settings.pendingClass );
				this.pending[ element.name ] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;

			// Sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[ element.name ];
			$( element ).removeClass( this.settings.pendingClass );
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$( this.currentForm ).submit();

				// Remove the hidden input that was used as a replacement for the
				// missing submit button. The hidden input is added by `handle()`
				// to ensure that the value of the used submit button is passed on
				// for scripted submits triggered by this method
				if ( this.submitButton ) {
					$( "input:hidden[name='" + this.submitButton.name + "']", this.currentForm ).remove();
				}

				this.formSubmitted = false;
			} else if ( !valid && this.pendingRequest === 0 && this.formSubmitted ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
				this.formSubmitted = false;
			}
		},

		previousValue: function( element, method ) {
			method = typeof method === "string" && method || "remote";

			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, { method: method } )
			} );
		},

		// Cleans up all forms and elements, removes validator-specific events
		destroy: function() {
			this.resetForm();

			$( this.currentForm )
				.off( ".validate" )
				.removeData( "validator" )
				.find( ".validate-equalTo-blur" )
					.off( ".validate-equalTo" )
					.removeClass( "validate-equalTo-blur" );
		}

	},

	classRuleSettings: {
		required: { required: true },
		email: { email: true },
		url: { url: true },
		date: { date: true },
		dateISO: { dateISO: true },
		number: { number: true },
		digits: { digits: true },
		creditcard: { creditcard: true }
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[ className ] = rules;
		} else {
			$.extend( this.classRuleSettings, className );
		}
	},

	classRules: function( element ) {
		var rules = {},
			classes = $( element ).attr( "class" );

		if ( classes ) {
			$.each( classes.split( " " ), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend( rules, $.validator.classRuleSettings[ this ] );
				}
			} );
		}
		return rules;
	},

	normalizeAttributeRule: function( rules, type, method, value ) {

		// Convert the value to a number for number inputs, and for text for backwards compability
		// allows type="date" and others to be compared as strings
		if ( /min|max|step/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
			value = Number( value );

			// Support Opera Mini, which returns NaN for undefined minlength
			if ( isNaN( value ) ) {
				value = undefined;
			}
		}

		if ( value || value === 0 ) {
			rules[ method ] = value;
		} else if ( type === method && type !== "range" ) {

			// Exception: the jquery validate 'range' method
			// does not test for the html5 'range' type
			rules[ method ] = true;
		}
	},

	attributeRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {

			// Support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = element.getAttribute( method );

				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}

				// Force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr( method );
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}

		// 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );
			this.normalizeAttributeRule( rules, type, method, value );
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {},
			validator = $.data( element.form, "validator" );

		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {

		// Handle dependency check
		$.each( rules, function( prop, val ) {

			// Ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[ prop ];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch ( typeof val.depends ) {
				case "string":
					keepRule = !!$( val.depends, element.form ).length;
					break;
				case "function":
					keepRule = val.depends.call( element, element );
					break;
				}
				if ( keepRule ) {
					rules[ prop ] = val.param !== undefined ? val.param : true;
				} else {
					$.data( element.form, "validator" ).resetElements( $( element ) );
					delete rules[ prop ];
				}
			}
		} );

		// Evaluate parameters
		$.each( rules, function( rule, parameter ) {
			rules[ rule ] = $.isFunction( parameter ) && rule !== "normalizer" ? parameter( element ) : parameter;
		} );

		// Clean number parameters
		$.each( [ "minlength", "maxlength" ], function() {
			if ( rules[ this ] ) {
				rules[ this ] = Number( rules[ this ] );
			}
		} );
		$.each( [ "rangelength", "range" ], function() {
			var parts;
			if ( rules[ this ] ) {
				if ( $.isArray( rules[ this ] ) ) {
					rules[ this ] = [ Number( rules[ this ][ 0 ] ), Number( rules[ this ][ 1 ] ) ];
				} else if ( typeof rules[ this ] === "string" ) {
					parts = rules[ this ].replace( /[\[\]]/g, "" ).split( /[\s,]+/ );
					rules[ this ] = [ Number( parts[ 0 ] ), Number( parts[ 1 ] ) ];
				}
			}
		} );

		if ( $.validator.autoCreateRanges ) {

			// Auto-create ranges
			if ( rules.min != null && rules.max != null ) {
				rules.range = [ rules.min, rules.max ];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength != null && rules.maxlength != null ) {
				rules.rangelength = [ rules.minlength, rules.maxlength ];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each( data.split( /\s/ ), function() {
				transformed[ this ] = true;
			} );
			data = transformed;
		}
		return data;
	},

	// https://jqueryvalidation.org/jQuery.validator.addMethod/
	addMethod: function( name, method, message ) {
		$.validator.methods[ name ] = method;
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
		if ( method.length < 3 ) {
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );
		}
	},

	// https://jqueryvalidation.org/jQuery.validator.methods/
	methods: {

		// https://jqueryvalidation.org/required-method/
		required: function( value, element, param ) {

			// Check if dependency is met
			if ( !this.depend( param, element ) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {

				// Could be an array for select-multiple or a string, both are fine this way
				var val = $( element ).val();
				return val && val.length > 0;
			}
			if ( this.checkable( element ) ) {
				return this.getLength( value, element ) > 0;
			}
			return value.length > 0;
		},

		// https://jqueryvalidation.org/email-method/
		email: function( value, element ) {

			// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
			// Retrieved 2014-01-14
			// If you have a problem with this implementation, report a bug against the above spec
			// Or use custom methods to implement your own email validation
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		// https://jqueryvalidation.org/url-method/
		url: function( value, element ) {

			// Copyright (c) 2010-2013 Diego Perini, MIT licensed
			// https://gist.github.com/dperini/729294
			// see also https://mathiasbynens.be/demo/url-regex
			// modified to allow protocol-relative URLs
			return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
		},

		// https://jqueryvalidation.org/date-method/
		date: function( value, element ) {
			return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
		},

		// https://jqueryvalidation.org/dateISO-method/
		dateISO: function( value, element ) {
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
		},

		// https://jqueryvalidation.org/number-method/
		number: function( value, element ) {
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		},

		// https://jqueryvalidation.org/digits-method/
		digits: function( value, element ) {
			return this.optional( element ) || /^\d+$/.test( value );
		},

		// https://jqueryvalidation.org/minlength-method/
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length >= param;
		},

		// https://jqueryvalidation.org/maxlength-method/
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length <= param;
		},

		// https://jqueryvalidation.org/rangelength-method/
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
		},

		// https://jqueryvalidation.org/min-method/
		min: function( value, element, param ) {
			return this.optional( element ) || value >= param;
		},

		// https://jqueryvalidation.org/max-method/
		max: function( value, element, param ) {
			return this.optional( element ) || value <= param;
		},

		// https://jqueryvalidation.org/range-method/
		range: function( value, element, param ) {
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
		},

		// https://jqueryvalidation.org/step-method/
		step: function( value, element, param ) {
			var type = $( element ).attr( "type" ),
				errorMessage = "Step attribute on input type " + type + " is not supported.",
				supportedTypes = [ "text", "number", "range" ],
				re = new RegExp( "\\b" + type + "\\b" ),
				notSupported = type && !re.test( supportedTypes.join() ),
				decimalPlaces = function( num ) {
					var match = ( "" + num ).match( /(?:\.(\d+))?$/ );
					if ( !match ) {
						return 0;
					}

					// Number of digits right of decimal point.
					return match[ 1 ] ? match[ 1 ].length : 0;
				},
				toInt = function( num ) {
					return Math.round( num * Math.pow( 10, decimals ) );
				},
				valid = true,
				decimals;

			// Works only for text, number and range input types
			// TODO find a way to support input types date, datetime, datetime-local, month, time and week
			if ( notSupported ) {
				throw new Error( errorMessage );
			}

			decimals = decimalPlaces( param );

			// Value can't have too many decimals
			if ( decimalPlaces( value ) > decimals || toInt( value ) % toInt( param ) !== 0 ) {
				valid = false;
			}

			return this.optional( element ) || valid;
		},

		// https://jqueryvalidation.org/equalTo-method/
		equalTo: function( value, element, param ) {

			// Bind to the blur event of the target in order to revalidate whenever the target field is updated
			var target = $( param );
			if ( this.settings.onfocusout && target.not( ".validate-equalTo-blur" ).length ) {
				target.addClass( "validate-equalTo-blur" ).on( "blur.validate-equalTo", function() {
					$( element ).valid();
				} );
			}
			return value === target.val();
		},

		// https://jqueryvalidation.org/remote-method/
		remote: function( value, element, param, method ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}

			method = typeof method === "string" && method || "remote";

			var previous = this.previousValue( element, method ),
				validator, data, optionDataString;

			if ( !this.settings.messages[ element.name ] ) {
				this.settings.messages[ element.name ] = {};
			}
			previous.originalMessage = previous.originalMessage || this.settings.messages[ element.name ][ method ];
			this.settings.messages[ element.name ][ method ] = previous.message;

			param = typeof param === "string" && { url: param } || param;
			optionDataString = $.param( $.extend( { data: value }, param.data ) );
			if ( previous.old === optionDataString ) {
				return previous.valid;
			}

			previous.old = optionDataString;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true",
						errors, message, submitted;

					validator.settings.messages[ element.name ][ method ] = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
						validator.resetInternals();
						validator.toHide = validator.errorsFor( element );
						validator.formSubmitted = submitted;
						validator.successList.push( element );
						validator.invalid[ element.name ] = false;
						validator.showErrors();
					} else {
						errors = {};
						message = response || validator.defaultMessage( element, { method: method, parameters: value } );
						errors[ element.name ] = previous.message = message;
						validator.invalid[ element.name ] = true;
						validator.showErrors( errors );
					}
					previous.valid = valid;
					validator.stopRequest( element, valid );
				}
			}, param ) );
			return "pending";
		}
	}

} );

// Ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;

// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter( function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = xhr;
		}
	} );
} else {

	// Proxy ajax
	ajax = $.ajax;
	$.ajax = function( settings ) {
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;
		if ( mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = ajax.apply( this, arguments );
			return pendingRequests[ port ];
		}
		return ajax.apply( this, arguments );
	};
}
return $;
}));

/*
	jQuery autoComplete v1.0.7
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/jQuery-autoComplete
	License: http://www.opensource.org/licenses/mit-license.php
*/

;(function($){
    $.fn.autoComplete = function(options){
        var o = $.extend({}, $.fn.autoComplete.defaults, options);

        // public methods
        if (typeof options == 'string') {
            this.each(function(){
                var that = $(this);
                if (options == 'destroy') {
                    $(window).off('resize.autocomplete', that.updateSC);
                    that.off('blur.autocomplete focus.autocomplete keydown.autocomplete keyup.autocomplete');
                    if (that.data('autocomplete'))
                        that.attr('autocomplete', that.data('autocomplete'));
                    else
                        that.removeAttr('autocomplete');
                    $(that.data('sc')).remove();
                    that.removeData('sc').removeData('autocomplete');
                }
            });
            return this;
        }

        return this.each(function(){
            var that = $(this);
            // sc = 'suggestions container'
            that.sc = $('<div class="autocomplete-suggestions '+o.menuClass+'"></div>');
            that.data('sc', that.sc).data('autocomplete', that.attr('autocomplete'));
            that.attr('autocomplete', 'off');
            that.cache = {};
            that.last_val = '';

            that.updateSC = function(resize, next){
                that.sc.css({
                    top: that.offset().top + that.outerHeight(),
                    left: that.offset().left,
                    width: that.outerWidth()
                });
                if (!resize) {
                    that.sc.show();
                    if (!that.sc.maxHeight) that.sc.maxHeight = parseInt(that.sc.css('max-height'));
                    if (!that.sc.suggestionHeight) that.sc.suggestionHeight = $('.autocomplete-suggestion', that.sc).first().outerHeight();
                    if (that.sc.suggestionHeight)
                        if (!next) that.sc.scrollTop(0);
                        else {
                            var scrTop = that.sc.scrollTop(), selTop = next.offset().top - that.sc.offset().top;
                            if (selTop + that.sc.suggestionHeight - that.sc.maxHeight > 0)
                                that.sc.scrollTop(selTop + that.sc.suggestionHeight + scrTop - that.sc.maxHeight);
                            else if (selTop < 0)
                                that.sc.scrollTop(selTop + scrTop);
                        }
                }
            }
            $(window).on('resize.autocomplete', that.updateSC);

            that.sc.appendTo('body');

            that.sc.on('mouseleave', '.autocomplete-suggestion', function (){
                $('.autocomplete-suggestion.selected').removeClass('selected');
            });

            that.sc.on('mouseenter', '.autocomplete-suggestion', function (){
                $('.autocomplete-suggestion.selected').removeClass('selected');
                $(this).addClass('selected');
            });

            that.sc.on('mousedown click', '.autocomplete-suggestion', function (e){
                var item = $(this), v = item.data('val');
                if (v || item.hasClass('autocomplete-suggestion')) { // else outside click
                    that.val(v);
                    o.onSelect(e, v, item);
                    that.sc.hide();
                }
                return false;
            });

            that.on('blur.autocomplete', function(){
                try { over_sb = $('.autocomplete-suggestions:hover').length; } catch(e){ over_sb = 0; } // IE7 fix :hover
                if (!over_sb) {
                    that.last_val = that.val();
                    that.sc.hide();
                    setTimeout(function(){ that.sc.hide(); }, 350); // hide suggestions on fast input
                } else if (!that.is(':focus')) setTimeout(function(){ that.focus(); }, 20);
            });

            if (!o.minChars) that.on('focus.autocomplete', function(){ that.last_val = '\n'; that.trigger('keyup.autocomplete'); });

            function suggest(data){
                var val = that.val();
                that.cache[val] = data;
                if (data.length && val.length >= o.minChars) {
                    var s = '';
                    for (var i=0;i<data.length;i++) s += o.renderItem(data[i], val);
                    that.sc.html(s);
                    that.updateSC(0);
                }
                else
                    that.sc.hide();
            }

            that.on('keydown.autocomplete', function(e){
                // down (40), up (38)
                if ((e.which == 40 || e.which == 38) && that.sc.html()) {
                    var next, sel = $('.autocomplete-suggestion.selected', that.sc);
                    if (!sel.length) {
                        next = (e.which == 40) ? $('.autocomplete-suggestion', that.sc).first() : $('.autocomplete-suggestion', that.sc).last();
                        that.val(next.addClass('selected').data('val'));
                    } else {
                        next = (e.which == 40) ? sel.next('.autocomplete-suggestion') : sel.prev('.autocomplete-suggestion');
                        if (next.length) { sel.removeClass('selected'); that.val(next.addClass('selected').data('val')); }
                        else { sel.removeClass('selected'); that.val(that.last_val); next = 0; }
                    }
                    that.updateSC(0, next);
                    return false;
                }
                // esc
                else if (e.which == 27) that.val(that.last_val).sc.hide();
                // enter or tab
                else if (e.which == 13 || e.which == 9) {
                    var sel = $('.autocomplete-suggestion.selected', that.sc);
                    if (sel.length && that.sc.is(':visible')) { o.onSelect(e, sel.data('val'), sel); setTimeout(function(){ that.sc.hide(); }, 20); }
                }
            });

            that.on('keyup.autocomplete', function(e){
                if (!~$.inArray(e.which, [13, 27, 35, 36, 37, 38, 39, 40])) {
                    var val = that.val();
                    if (val.length >= o.minChars) {
                        if (val != that.last_val) {
                            that.last_val = val;
                            clearTimeout(that.timer);
                            if (o.cache) {
                                if (val in that.cache) { suggest(that.cache[val]); return; }
                                // no requests if previous suggestions were empty
                                for (var i=1; i<val.length-o.minChars; i++) {
                                    var part = val.slice(0, val.length-i);
                                    if (part in that.cache && !that.cache[part].length) { suggest([]); return; }
                                }
                            }
                            that.timer = setTimeout(function(){ o.source(val, suggest) }, o.delay);
                        }
                    } else {
                        that.last_val = val;
                        that.sc.hide();
                    }
                }
            });
        });
    }

    $.fn.autoComplete.defaults = {
        source: 0,
        minChars: 3,
        delay: 150,
        cache: 1,
        menuClass: '',
        renderItem: function (item, search){
            // escape special characters
            search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
            return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
        },
        onSelect: function(e, term, item){}
    };
}(jQuery));




jQuery(document).ready(function(){
  jQuery('#site-menu--default').kinstaSiteNavigation();
  jQuery('#sidebar__sticky').kinstaStickySidebar();
})

jQuery(window).on('load', function(){
  jQuery('#kinsta-promo-widget').kinstaPromoWidget();
})

jQuery(document).ready(function(){

  if(jQuery('.carousel').length > 0 ) {
    jQuery('.carousel').slick({
      slidesToShow: 1,
			easing: 'ease-in',
      infinite: false,
			draggable: false,
			accessible: false,
      speed: 400,
      waitForAnimate: true,
      nextArrow: "<div class='carousel-next'>" + kinsta.chevronRight + "</div>",
      prevArrow: "<div class='carousel-prev'>" + kinsta.chevronLeft + "</div>",
    });
  }
})


jQuery(document).on('mouseover', '.tabs__nav > div', function() {
	if(jQuery(window).width() < 767 ) {
		return false;
	}

	var hTab = jQuery(this).parents('.tabs');
	hTab.find('.tab__content-container').show();
	var index = jQuery(this).index();
	hTab.find('.tabs__nav').find('div').removeClass('active');
	jQuery(this).addClass('active');

	hTab.find('.tabs__section').hide();
	hTab.find('.tabs__section').eq(index).show();
})

var touchmoved;
jQuery(document).on('touchend', '.tabs__nav > div', function() {
	if(touchmoved === true || jQuery(window).width() > 769 ){
		return;
	}
	var target = jQuery(this).attr('data-src');
	jQuery.fancybox.open({
		src  : target,
		type : 'inline',
	});
}).on('touchmove', function(e){
    touchmoved = true;
}).on('touchstart', function(){
    touchmoved = false;
});


jQuery.each(jQuery( '.card-slider ul' ), function( slider ) {
	var slider = jQuery(this).parents('.card-slider');
	slider.find('li:first').addClass('shown')
	jQuery(this).baraja({
	  nextEl : slider.find('.card-slider__next'),
	  // if we want to specify a selector that triggers the previous() function
	  prevEl : slider.find('.card-slider__prev'),
	});
})


jQuery(document).on('click', '.image-slider li', function() {
	jQuery(this).parents('.image-slider').find('.card-slider__next').trigger('click')
})

jQuery(document).on('click', '.submitter .submitter__trigger', function() {
	var form = jQuery(this).parents('form');
	var input = form.find('input')[0];
	if( input.value === null || !input.value || typeof input.value === 'undefined' ) {
		input.focus();
	}
	else {
		form.submit();
	}
})




function setLoading( element, text ) {
	var template = '<div>'+text+'</div><div class="loading-dots"><span></span><span></span><span></span></div>';
	element.addClass('loading')
	element.parents('form').addClass('loading')
	element.attr('data-text', element.html());
	element.html(template)
}

function removeLoading( element ) {
		element.parents('form').removeClass('loading')
		element.removeClass('loading');
		element.html(element.attr('data-text'));
}


jQuery(document).on('ready', function() {
	if(jQuery(window).width() > 500 ) {

		jQuery('[data-tooltip!=""]').qtip({
			style: {
				classes: 'qtip-light qtip-shadow'
			},
			position: {
				my: 'center left',
				at: 'center right',
				viewport: jQuery(window)

			},
		  content: {
		    attr: 'data-tooltip'
		  }
		})

		jQuery('abbr').qtip({
			style: {
				classes: 'qtip-light qtip-shadow'
			},
			position: {
				my: 'center left',
				at: 'center right',
				viewport: jQuery(window)

			},
		  content: {
		    attr: 'title'
		  }
		})
	} else {

		jQuery(document).on('touchend', '[data-tooltip!=""]', function() {
			if(typeof jQuery(this).attr('data-tooltip') === 'undefined' ) {
				return;
			}
			var content = jQuery(this).attr('data-tooltip')
			jQuery.fancybox.open({
				content  : content,
				type : 'html',
			});
		})


		jQuery(document).on('touchend', 'abbr', function() {
			var content = jQuery(this).attr('title')
			jQuery.fancybox.open({
				content  : content,
				type : 'html',
			});
		})

	}


})





function goToSection( event, state, location ){
	window.scroll({
		top: jQuery(location).offset().top - 140,
		behavior: 'smooth'
	});

	history.pushState(null, null, state);
	if( event ) {
		event.preventDefault();
	}
	return false;
}


jQuery(window).on('popstate',function(event) {
	event.preventDefault();
	if ('scrollRestoration' in history) {
  	history.scrollRestoration = 'manual';
	}

  if( document.location.hash !== '' ) {
		window.scroll({
			top: jQuery(document.location.hash).offset().top - 140,
			behavior: 'smooth'
		});
	}

});



var countries = [
{"name": "Afghanistan", "code": "AF"},
{"name": "land Islands", "code": "AX"},
{"name": "Albania", "code": "AL"},
{"name": "Algeria", "code": "DZ"},
{"name": "American Samoa", "code": "AS"},
{"name": "AndorrA", "code": "AD"},
{"name": "Angola", "code": "AO"},
{"name": "Anguilla", "code": "AI"},
{"name": "Antarctica", "code": "AQ"},
{"name": "Antigua and Barbuda", "code": "AG"},
{"name": "Argentina", "code": "AR"},
{"name": "Armenia", "code": "AM"},
{"name": "Aruba", "code": "AW"},
{"name": "Australia", "code": "AU"},
{"name": "Austria", "code": "AT"},
{"name": "Azerbaijan", "code": "AZ"},
{"name": "Bahamas", "code": "BS"},
{"name": "Bahrain", "code": "BH"},
{"name": "Bangladesh", "code": "BD"},
{"name": "Barbados", "code": "BB"},
{"name": "Belarus", "code": "BY"},
{"name": "Belgium", "code": "BE"},
{"name": "Belize", "code": "BZ"},
{"name": "Benin", "code": "BJ"},
{"name": "Bermuda", "code": "BM"},
{"name": "Bhutan", "code": "BT"},
{"name": "Bolivia", "code": "BO"},
{"name": "Bosnia and Herzegovina", "code": "BA"},
{"name": "Botswana", "code": "BW"},
{"name": "Bouvet Island", "code": "BV"},
{"name": "Brazil", "code": "BR"},
{"name": "British Indian Ocean Territory", "code": "IO"},
{"name": "Brunei Darussalam", "code": "BN"},
{"name": "Bulgaria", "code": "BG"},
{"name": "Burkina Faso", "code": "BF"},
{"name": "Burundi", "code": "BI"},
{"name": "Cambodia", "code": "KH"},
{"name": "Cameroon", "code": "CM"},
{"name": "Canada", "code": "CA"},
{"name": "Cape Verde", "code": "CV"},
{"name": "Cayman Islands", "code": "KY"},
{"name": "Central African Republic", "code": "CF"},
{"name": "Chad", "code": "TD"},
{"name": "Chile", "code": "CL"},
{"name": "China", "code": "CN"},
{"name": "Christmas Island", "code": "CX"},
{"name": "Cocos (Keeling) Islands", "code": "CC"},
{"name": "Colombia", "code": "CO"},
{"name": "Comoros", "code": "KM"},
{"name": "Congo", "code": "CG"},
{"name": "Congo, The Democratic Republic of the", "code": "CD"},
{"name": "Cook Islands", "code": "CK"},
{"name": "Costa Rica", "code": "CR"},
{"name": "Cote D'Ivoire", "code": "CI"},
{"name": "Croatia", "code": "HR"},
{"name": "Cuba", "code": "CU"},
{"name": "Cyprus", "code": "CY"},
{"name": "Czech Republic", "code": "CZ"},
{"name": "Denmark", "code": "DK"},
{"name": "Djibouti", "code": "DJ"},
{"name": "Dominica", "code": "DM"},
{"name": "Dominican Republic", "code": "DO"},
{"name": "Ecuador", "code": "EC"},
{"name": "Egypt", "code": "EG"},
{"name": "El Salvador", "code": "SV"},
{"name": "Equatorial Guinea", "code": "GQ"},
{"name": "Eritrea", "code": "ER"},
{"name": "Estonia", "code": "EE"},
{"name": "Ethiopia", "code": "ET"},
{"name": "Falkland Islands (Malvinas)", "code": "FK"},
{"name": "Faroe Islands", "code": "FO"},
{"name": "Fiji", "code": "FJ"},
{"name": "Finland", "code": "FI"},
{"name": "France", "code": "FR"},
{"name": "French Guiana", "code": "GF"},
{"name": "French Polynesia", "code": "PF"},
{"name": "French Southern Territories", "code": "TF"},
{"name": "Gabon", "code": "GA"},
{"name": "Gambia", "code": "GM"},
{"name": "Georgia", "code": "GE"},
{"name": "Germany", "code": "DE"},
{"name": "Ghana", "code": "GH"},
{"name": "Gibraltar", "code": "GI"},
{"name": "Greece", "code": "GR"},
{"name": "Greenland", "code": "GL"},
{"name": "Grenada", "code": "GD"},
{"name": "Guadeloupe", "code": "GP"},
{"name": "Guam", "code": "GU"},
{"name": "Guatemala", "code": "GT"},
{"name": "Guernsey", "code": "GG"},
{"name": "Guinea", "code": "GN"},
{"name": "Guinea-Bissau", "code": "GW"},
{"name": "Guyana", "code": "GY"},
{"name": "Haiti", "code": "HT"},
{"name": "Heard Island and Mcdonald Islands", "code": "HM"},
{"name": "Holy See (Vatican City State)", "code": "VA"},
{"name": "Honduras", "code": "HN"},
{"name": "Hong Kong", "code": "HK"},
{"name": "Hungary", "code": "HU"},
{"name": "Iceland", "code": "IS"},
{"name": "India", "code": "IN"},
{"name": "Indonesia", "code": "ID"},
{"name": "Iran, Islamic Republic Of", "code": "IR"},
{"name": "Iraq", "code": "IQ"},
{"name": "Ireland", "code": "IE"},
{"name": "Isle of Man", "code": "IM"},
{"name": "Israel", "code": "IL"},
{"name": "Italy", "code": "IT"},
{"name": "Jamaica", "code": "JM"},
{"name": "Japan", "code": "JP"},
{"name": "Jersey", "code": "JE"},
{"name": "Jordan", "code": "JO"},
{"name": "Kazakhstan", "code": "KZ"},
{"name": "Kenya", "code": "KE"},
{"name": "Kiribati", "code": "KI"},
{"name": "Korea, Republic of", "code": "KR"},
{"name": "Kuwait", "code": "KW"},
{"name": "Kyrgyzstan", "code": "KG"},
{"name": "Lao People's Democratic Republic", "code": "LA"},
{"name": "Latvia", "code": "LV"},
{"name": "Lebanon", "code": "LB"},
{"name": "Lesotho", "code": "LS"},
{"name": "Liberia", "code": "LR"},
{"name": "Libyan Arab Jamahiriya", "code": "LY"},
{"name": "Liechtenstein", "code": "LI"},
{"name": "Lithuania", "code": "LT"},
{"name": "Luxembourg", "code": "LU"},
{"name": "Macao", "code": "MO"},
{"name": "Macedonia, The Former Yugoslav Republic of", "code": "MK"},
{"name": "Madagascar", "code": "MG"},
{"name": "Malawi", "code": "MW"},
{"name": "Malaysia", "code": "MY"},
{"name": "Maldives", "code": "MV"},
{"name": "Mali", "code": "ML"},
{"name": "Malta", "code": "MT"},
{"name": "Marshall Islands", "code": "MH"},
{"name": "Martinique", "code": "MQ"},
{"name": "Mauritania", "code": "MR"},
{"name": "Mauritius", "code": "MU"},
{"name": "Mayotte", "code": "YT"},
{"name": "Mexico", "code": "MX"},
{"name": "Micronesia, Federated States of", "code": "FM"},
{"name": "Moldova, Republic of", "code": "MD"},
{"name": "Monaco", "code": "MC"},
{"name": "Mongolia", "code": "MN"},
{"name": "Montenegro", "code": "ME"},
{"name": "Montserrat", "code": "MS"},
{"name": "Morocco", "code": "MA"},
{"name": "Mozambique", "code": "MZ"},
{"name": "Myanmar", "code": "MM"},
{"name": "Namibia", "code": "NA"},
{"name": "Nauru", "code": "NR"},
{"name": "Nepal", "code": "NP"},
{"name": "Netherlands", "code": "NL"},
{"name": "Netherlands Antilles", "code": "AN"},
{"name": "New Caledonia", "code": "NC"},
{"name": "New Zealand", "code": "NZ"},
{"name": "Nicaragua", "code": "NI"},
{"name": "Niger", "code": "NE"},
{"name": "Nigeria", "code": "NG"},
{"name": "Niue", "code": "NU"},
{"name": "Norfolk Island", "code": "NF"},
{"name": "Northern Mariana Islands", "code": "MP"},
{"name": "Norway", "code": "NO"},
{"name": "Oman", "code": "OM"},
{"name": "Pakistan", "code": "PK"},
{"name": "Palau", "code": "PW"},
{"name": "Palestinian Territory, Occupied", "code": "PS"},
{"name": "Panama", "code": "PA"},
{"name": "Papua New Guinea", "code": "PG"},
{"name": "Paraguay", "code": "PY"},
{"name": "Peru", "code": "PE"},
{"name": "Philippines", "code": "PH"},
{"name": "Pitcairn", "code": "PN"},
{"name": "Poland", "code": "PL"},
{"name": "Portugal", "code": "PT"},
{"name": "Puerto Rico", "code": "PR"},
{"name": "Qatar", "code": "QA"},
{"name": "Reunion", "code": "RE"},
{"name": "Romania", "code": "RO"},
{"name": "Russian Federation", "code": "RU"},
{"name": "RWANDA", "code": "RW"},
{"name": "Saint Helena", "code": "SH"},
{"name": "Saint Kitts and Nevis", "code": "KN"},
{"name": "Saint Lucia", "code": "LC"},
{"name": "Saint Pierre and Miquelon", "code": "PM"},
{"name": "Saint Vincent and the Grenadines", "code": "VC"},
{"name": "Samoa", "code": "WS"},
{"name": "San Marino", "code": "SM"},
{"name": "Sao Tome and Principe", "code": "ST"},
{"name": "Saudi Arabia", "code": "SA"},
{"name": "Senegal", "code": "SN"},
{"name": "Serbia", "code": "RS"},
{"name": "Seychelles", "code": "SC"},
{"name": "Sierra Leone", "code": "SL"},
{"name": "Singapore", "code": "SG"},
{"name": "Slovakia", "code": "SK"},
{"name": "Slovenia", "code": "SI"},
{"name": "Solomon Islands", "code": "SB"},
{"name": "Somalia", "code": "SO"},
{"name": "South Africa", "code": "ZA"},
{"name": "South Georgia and the South Sandwich Islands", "code": "GS"},
{"name": "Spain", "code": "ES"},
{"name": "Sri Lanka", "code": "LK"},
{"name": "Sudan", "code": "SD"},
{"name": "Suriname", "code": "SR"},
{"name": "Svalbard and Jan Mayen", "code": "SJ"},
{"name": "Swaziland", "code": "SZ"},
{"name": "Sweden", "code": "SE"},
{"name": "Switzerland", "code": "CH"},
{"name": "Syrian Arab Republic", "code": "SY"},
{"name": "Taiwan, Province of China", "code": "TW"},
{"name": "Tajikistan", "code": "TJ"},
{"name": "Tanzania, United Republic of", "code": "TZ"},
{"name": "Thailand", "code": "TH"},
{"name": "Timor-Leste", "code": "TL"},
{"name": "Togo", "code": "TG"},
{"name": "Tokelau", "code": "TK"},
{"name": "Tonga", "code": "TO"},
{"name": "Trinidad and Tobago", "code": "TT"},
{"name": "Tunisia", "code": "TN"},
{"name": "Turkey", "code": "TR"},
{"name": "Turkmenistan", "code": "TM"},
{"name": "Turks and Caicos Islands", "code": "TC"},
{"name": "Tuvalu", "code": "TV"},
{"name": "Uganda", "code": "UG"},
{"name": "Ukraine", "code": "UA"},
{"name": "United Arab Emirates", "code": "AE"},
{"name": "United Kingdom", "code": "GB"},
{"name": "United States", "code": "US"},
{"name": "United States Minor Outlying Islands", "code": "UM"},
{"name": "Uruguay", "code": "UY"},
{"name": "Uzbekistan", "code": "UZ"},
{"name": "Vanuatu", "code": "VU"},
{"name": "Venezuela", "code": "VE"},
{"name": "Viet Nam", "code": "VN"},
{"name": "Virgin Islands, British", "code": "VG"},
{"name": "Virgin Islands, U.S.", "code": "VI"},
{"name": "Wallis and Futuna", "code": "WF"},
{"name": "Western Sahara", "code": "EH"},
{"name": "Yemen", "code": "YE"},
{"name": "Zambia", "code": "ZM"},
{"name": "Zimbabwe", "code": "ZW"}
]

countryList = countries.map(function (item) {
	return item.name
})

function getCountryFromIso( iso ) {
	name = 'Unknown';
	countries.forEach( function(item) {
		if(item.code === iso ) {
			name = item.name
		}
	})

	return name;
}


jQuery.each(jQuery('.country-autocomplete'), function( i, element ) {
	jQuery(element).autoComplete({
		minChars: 1,
    source: function(term, suggest){
      term = term.toLowerCase();
      var matches = [];
      for (i=0; i<countryList.length; i++) {
        if (countryList[i].toLowerCase().indexOf(term) !== -1) {
					matches.push(countryList[i])
				}
			}
      suggest(matches);
    },
	});
})

jQuery(document).on('blur', '.country-autocomplete', function() {
	element = jQuery(this);
	country = element.val();
	matches = []
	countries.forEach(function(countryData) {
		if( countryData.name.toLowerCase().indexOf(country.toLowerCase()) !== -1 ) {
			matches.push(countryData);
		}
	})

	if(matches.length === 1) {
		match = matches[0];
		element.val(match.name)
	}

	else {
		element.next().val('');
	}

});


jQuery.validator.addMethod( 'vatFormat', function(value, element) {
	if( !value ) {
		return true;
	}
	var check = jsvat.checkVAT(value)
	return check.isValid;
}, "The entered VAT number is invalid")

jQuery.validator.addMethod( 'checkVies', function(value, element) {
	if( !value ) {
		return true;
	}

	result = false;
	jQuery.ajax({
		url: kinsta.ajaxurl,
		method: 'post',
		async: false,
		dataType: 'json',
		data: {
			vat: value,
			action: 'check_vies'
		},
		success: function(response) {
			result = response.valid;
		}
	})

	return result;

}, "The VAT ID entered is invalid or inactive")


jQuery.validator.addMethod( 'passwordFormat', function(value, element) {
	if( !value ) {
		return false;
	}

	if( value.match(/[A-Z]/) !== null && value.match(/[a-z]/) !== null && value.match(/[0-9]/) !== null ) {
		return true
	} else {
		return false;
	}

	return check.isValid;
}, "Please use at least a character and a number")


jQuery.validator.addMethod( 'freeEmail', function(value, element) {
	if(!jQuery.validator.methods.email.call(this, value, element)) {
		return false;
	}

	if( !value ) {
		return false;
	}

	result = false;
	jQuery.ajax({
		url: kinsta.ajaxurl,
		method: 'post',
		async: false,
		dataType: 'json',
		data: {
			email: value,
			action: 'check_mykinsta_email'
		},
		success: function(response) {
			result = response.valid;
		}
	})

	return result;

}, "This email is already in use")

jQuery.validator.setDefaults({
  rules: {
		state: 'required',
	}
});




/* Interval Switcher */

//jQuery(document).on('click')

jQuery(document).on('change', '.interval-switcher', function(e) {
	e.preventDefault();
	interval = jQuery('.interval-switcher').is(":checked") ? 'year' : 'month';
	handleIntervalSwitch( interval );
})

jQuery('.interval-switcher-container .label-year > p ').on('mouseenter', function() {
	if( jQuery('.interval-switcher').is(':checked') === false ) {
		jQuery('.interval-switcher-container').addClass('rightNudge')
	}
})
jQuery('.interval-switcher-container .label-year > p ').on('mouseleave', function() {
	jQuery('.interval-switcher-container').removeClass('rightNudge')
})


function toggleIntervalClass() {
  $body = jQuery('body')
  if( $body.hasClass('interval-year') ) {
    $body.removeClass('interval-year');
    $body.addClass('interval-month');
    return 'month';
  } else {
    $body.removeClass('interval-month');
    $body.addClass('interval-year');
    return 'year';

  }
}

function handleIntervalSwitch( interval ) {
	jQuery(".interval-switcher").prop("checked", (interval === 'year') ? true : false );

	jQuery.each(jQuery('.buy-button'), function() {
		planid = jQuery(this).parents('.plan').attr('data-id-' + interval);
		jQuery(this).attr('href', jQuery(this).attr('href').replace(/\?plan=.*/, '?plan=' + planid) );
	})

	jQuery('body').removeClass('interval-month').removeClass('interval-year').addClass('interval-' + interval)

	jQuery('.interval-switcher-container').attr('data-state', interval)

}


jQuery(document).on('change', '#hamburger-menu-trigger', function() {

	if(jQuery('#hamburger-menu-trigger').is(':checked')) {
		jQuery('html').addClass('menu-open');
		jQuery('.site-menu').addClass('mobile-nav').prependTo('body')
	} else {
		jQuery('html').removeClass('menu-open');
		jQuery('.site-menu').removeClass('mobile-nav').prependTo(jQuery('.site-menu-container'))
	}
})


jQuery(document).on('touchend', '.mobile-nav', function(e) {
	jQuery('#hamburger-menu-trigger').attr('checked', false);
	jQuery('#hamburger-menu-trigger').trigger('change')
})
jQuery(document).on('touchend', '.mobile-nav a, .mobile-nav label', function(e) {
	e.stopPropagation();
})




jQuery(document).on('submit', 'form[data-form="newsletter-subscribe"]', function() {
  form = jQuery(this);
  container = form.parents('.newsletter-subscribe-container');
  button = form.find('button');
	container.wrapInner("<div>");

	var	options = {
		beforeSend: function() {
			setLoading( button, 'Subscribing')
		},
		success: function() {
			container.height(container.height());
			container.children('div:first').fadeOut(function() {
				container.css({
					'display' :'flex',
					'align-items' : 'center',
					'justify-content' : 'center'
				})
				success = jQuery('<div class="row nocol center-xs middle-xs"><div class="mr--10">' + kinsta.check_m + '</div><div class="heading--small">Thanks for subscribing</div></div>');
			success.hide();
				container.prepend(success);
				success.fadeIn()
			})
		}
	}

	jQuery(this).ajaxSubmit(options);
  return false;
});


var animations = [];
jQuery(window).on('load', function() {
	jQuery.each(jQuery('.bodymovin'), function(container) {
		var animationContainer = jQuery(this);
		var staticImage = animationContainer.find('img')
		var imageName = staticImage.attr('src').match(/([^\/]*?).svg/g)[0].replace('.svg', '');
		var animationLocation = staticImage.attr('src').replace('.svg', '.json');
		var animationBox = jQuery('<div></div>');
		animationBox.addClass('animationBox').width(staticImage.width()).height(staticImage.height()).hide();
		animationContainer.append(animationBox);

		animationContainer.attr('data-name', imageName);

		var autoplay = false;
		if(animationContainer.attr('data-autoplay') === 'true' ) {
			autoplay = false;
		}
		var loop = true;
		if(animationContainer.attr('data-loop') === 'false' ) {
			loop = false;
		}

		if(animationContainer.visible( true )) {
			autoplay = true
		}

		jQuery.get(animationLocation, function(animationData) {
			if(animationData){
				var params = {
					container: animationBox[0],
					renderer: 'svg',
					loop: loop,
					autoplay: autoplay,
					animationData: animationData
				};

				staticImage.hide();
				animationBox.show();
				animations[imageName] = lottie.loadAnimation(params);
			}

		});

	})




	var debouncedAnimationHandler = debounce(function() {
		jQuery.each(jQuery('.bodymovin'), function() {
			var imageName = jQuery(this).attr('data-name');
			if( animations[imageName] ) {
				if(jQuery(this).visible( true )) {
					animations[imageName].play();
				} else {
					animations[imageName].stop();
				}
			}

		})
	}, 25);

	window.addEventListener("scroll", debouncedAnimationHandler, false);


})

jQuery(document).on('mouseenter', '.bodymovin[data-start="onhover"]', function() {
	var imageName = jQuery(this).attr('data-name');
	animations[imageName].play()
})
