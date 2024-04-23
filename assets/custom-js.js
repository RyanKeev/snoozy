'use strict'

document.addEventListener("DOMContentLoaded", function(event) {
  /********************************
   * Section FAQ
   *******************************/
  const FAQWrap = document.querySelectorAll('.faq-layout');
  const extraHeight = window.innerWidth >= 767 ? 20 : 15;

  if(FAQWrap){
    FAQWrap.forEach(sectionFAQWrap => {
      sectionFAQWrap.addEventListener('click', function ({target}){
        const itemActive = sectionFAQWrap.querySelector('.faq-item.active');
        const itemWrapper = target.closest('.faq-item');
        const itemAnswerWrap = itemWrapper.querySelector('.faq-answer');
        const itemAnswerHeight = itemAnswerWrap.querySelector('.answer-content').scrollHeight;

        if(target.closest('.faq-question')){
          if(itemWrapper.classList.contains('active')){
            itemWrapper.classList.remove('active');
            itemAnswerWrap.style.height = 0 + 'px';
          }else{
            if(itemActive){
              itemActive.classList.remove('active');
              itemActive.querySelector('.faq-answer').style.height = 0 + 'px';
            }
            itemWrapper.classList.add('active');
            itemAnswerWrap.style.height = (itemAnswerHeight + extraHeight) + "px";
          }
        }
      });
    });
  }

  /********************************
   * Cart
   *******************************/
  const observer = new MutationObserver(function(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.target === document.body && mutation.attributeName === 'class') {

        let buttonHideUpCart = document.querySelector('.btn-continue-shopping');
        buttonHideUpCart ? buttonHideUpCart.addEventListener('click', () =>{
          buttonHideUpCart.closest('#CartPopup').classList.remove('styles_active__7AzVD');
          document.querySelector('body').classList.remove('upcartPopupShow');
          document.querySelector('.upcart-backdrop').classList.remove('styles_active__7AzVD');

        }) : '';
      }
    }
  });

  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /*// Show/hide upsells depending on reward progress.
  window.upcartModifyListOfUpsells = function(items) {
    let upCartRewardsProgress = null;
    // if (!upCartRewardsProgress) {
      upCartRewardsProgress = document.body.querySelector('.upcart-rewards-bar-foreground');
      if (!upCartRewardsProgress) {
        return;
      }
    // }

    const widthStr = upCartRewardsProgress.style.width.replace(/[^0-9.]/g, '');
    const width = Math.floor(parseInt(widthStr));
    if (!isNaN(width) && width >= 100) {
      return [];
    }

    return items;
  };*/


  const renderSubTotal = (cartToShow) =>{
    renderSaveLabel(cartToShow?.items)
    renderSubTotalLabel(cartToShow);
  }

  /*** upCart: save label ***/
  const renderSaveLabel = (items) => {
    const discount = items.reduce((totalDiscount, item) => {
      const itemDiscount = item.compare_at_price
          ? (item.compare_at_price - item.discounted_price) * item.quantity
          : item.original_line_price - item.discounted_price * item.quantity;

      return totalDiscount + itemDiscount;
    }, 0);

    const savePriceLabel = document.querySelector('.cart-total-save');

    if (savePriceLabel) {
      const formattedDiscount = Shopify.formatMoney(discount);
      savePriceLabel.innerHTML = `- ${formattedDiscount}`;
    }
  }

  /*** upCart: total label ***/
  const renderSubTotalLabel = (cartToShow) =>{
    const upCartFooter = document.querySelector('.upcart-footer');

    if(upCartFooter){
      const cartTotalPrice = upCartFooter.querySelector('.cart-total-price');
      const cartButton = upCartFooter.querySelector('.upcart-checkout-button');
      cartTotalPrice.innerHTML = Shopify.formatMoney(cartToShow.total_price);
      cartButton.innerHTML = cartButton.textContent.split('•')[0];
    }
  }

  window.upcartOnCartUpdated = function(cartToShow){
    if (cartToShow.items !== 0) {
      window.cart_items = {};
      cartToShow.items.forEach(function(item,index){
        window.cart_items[index] = {
          'id': item['variant_id'],
          'key': item['key'],
          'q':item['quantity']
        };
      });
    }

    renderSubTotal(cartToShow);
  };

  window.upcartOnCartLoaded = function(cartToShow){
    renderSubTotal(cartToShow);
  }


  window.upcartModifyCart = function (cart) {
    if (cart.items !== 0) {
      window.cart_items = {};
      let update = [];
      cart.items.forEach(function(item,index){
        if (typeof(window.cart_items[item['key']]) === 'undefined') {
          window.cart_items[item['key']] = {
            'id': item['variant_id'],
            'key': item['key'],
            'q': [item['quantity']],
            'properties': item['properties']
          };
        } else {
          update.push(item['key']);
          window.cart_items[item['key']]['q'].push(item['quantity']);
        }
      });
      if (update.length > 0) {
        let remove = [];
        let done = [];
        cart.items.forEach(function(item,index){
          if (done.includes(item['key'])){
            cart.items[index]['quantity'] = window.cart_items[item['key']]['q'].reduce((accumulator, currentValue) => {
              return accumulator * 1 + currentValue * 1
            }, 0);
            cart.items[index].original_line_price = Math.floor((cart.items[index].price*cart.items[index]['quantity'])/100)*100;
            cart.items[index].line_price = Math.floor((cart.items[index].discounted_price*cart.items[index]['quantity'])/100)*100;
            cart.items[index].final_line_price = Math.floor((cart.items[index].discounted_price*cart.items[index]['quantity'])/100)*100;
          } else {
            if (update.includes(item['key'])) {
              remove.push(index);
              done.push(item['key']);
            }
          }
        });
        remove.forEach(function(r,i){
          cart.items.splice(r-i,1);
        });
        let formData = {
          'updates': {}
        };
        update.forEach(function (up) {
          formData['updates'][up] = 0;
        });
        fetch(window.Shopify.routes.root + 'cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
            .then(response => {
              let formData = {
                'updates': {}
              };
              update.forEach(function (up) {
                formData['updates'][up] = window.cart_items[up]['q'].reduce((accumulator, currentValue) => {
                  return accumulator * 1 + currentValue * 1
                }, 0);
              });
              fetch(window.Shopify.routes.root + 'cart/update.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
              })
                  .then(response => {
                    return response.json();
                  })
                  .catch((error) => {
                    console.error('Error:', error);
                  });
            })
            .catch((error) => {
              console.error('Error:', error);
            });
      }
      return cart;
    }
  }

  /********************************
   * Section: announcement bar
   *******************************/
  const scrollers = Array.from(document.querySelectorAll("div[data-scroll]"));

  if(scrollers?.length > 0){
    scrollers.forEach((scroller) => {
      const scrollerContent = Array.from(scroller.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        duplicatedItem.setAttribute("aria-hidden", true);
        scroller.appendChild(duplicatedItem);
      });

      scroller.setAttribute("data-animated", true);
    });
  }

  /********************************
   * Section: Recommend
   *******************************/
  const sectionsRecommend = Array.from(document.querySelectorAll('.section-recommend'));

  if(sectionsRecommend && sectionsRecommend.length > 0){
    const sliderRecommendInit = (slider) =>{
      new Swiper(slider, {
        slidesPerView: 2,
        breakpoints: {
          768: {
            slidesPerView: 3,
          },
          1200: {
            slidesPerView: 4,
          }
        }
      });
    }

    function handleRecommendedProducts(elm, replaceSelector, slider) {
      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(elm);

        fetch(elm.dataset.url)
          .then(response => response.text())
          .then(text => {
            const html = document.createElement('div');
            html.innerHTML = text;
            const recommendations = html.querySelector(replaceSelector);
            const replaceElm = elm.querySelector(replaceSelector);

            if (recommendations && recommendations.innerHTML.trim().length) {
              replaceElm.innerHTML = recommendations.innerHTML;
            }

            sliderRecommendInit(slider);
          })
          .catch(error => {console.error(error)}
        );
      }

      new IntersectionObserver(handleIntersection, {rootMargin: '0px 0px 400px 0px'}).observe(elm);
    }

    sectionsRecommend.forEach(section => {
      const slider = section.querySelector('.slider-recommend-init');

      if(section.classList.contains('section-recommend-auto')){
        handleRecommendedProducts(section,'.recommend-layout', slider)
      }else{
        sliderRecommendInit(slider);
      }
    })
  }
});