const COLOR_TYPE = 'color';

class ProductVariantSwatches extends VariantRadios {
  constructor() {
    super();

    this.productForm = null;
    this.optionsMap = null;

    this.initSwatches();
  }

  initSwatches() {
    this.updateOptions();
    this.updateMasterId();
    this.updateOptionsMap();
    this.updateColorName();
    this.updateColorLabel();

    subscribe(PUB_SUB_EVENTS.variantChange, this.updateAtcButton.bind(this));
    subscribe(PUB_SUB_EVENTS.quantityChange, this.updateAtcButtonPrice.bind(this));
  }

  onVariantChange() {
    super.onVariantChange();

    this.updateOptionsMap();
    this.updateColorName();

    this.reinitializeVideos()
    
  //     // Update the data attributes with the new prices
  // const variantData = document.getElementById('variant-data');
  // const price = variant.price; // Example: Use variant.price or any other logic to get the price
  // const discount10 = (price * 0.9).toFixed(2);
  // const discount15 = (price * 0.85).toFixed(2);

  // variantData.setAttribute('data-money-price', `${price}`);
  // variantData.setAttribute('data-discount-10', `${discount10}`);
  // variantData.setAttribute('data-discount-15', `${discount15}`);

  // Trigger the custom event
  document.dispatchEvent(new CustomEvent('variant:change'));
  }

  reinitializeVideos() {
    const videoBlock = document.querySelectorAll('.alchemy__element video')

    if (videoBlock.length > 0) {
      videoBlock.forEach((item, index) => {
        try {
          if (item.paused) {
            item.play()
          }
        } catch (e) {
          console.log(`>>>> Error playing video ${index}:`, e)
        }
      })
    }
  }

  updateColorName() {
    if (!this.optionsMap || !(COLOR_TYPE in this.optionsMap)) {
      return;
    }

    const label = this.querySelector('[data-option-handle="' + COLOR_TYPE + '"]');
    if (!label) {
      return;
    }

    const labelValue = label.querySelector('.swatch-option__label-value');
    if (labelValue) {
      labelValue.classList.remove('visibility-hidden');
      labelValue.textContent = '- ' + this.optionsMap[COLOR_TYPE].value;
    }
  }

  updateColorLabel() {
    const sizeVariantWrapper = this.querySelector('.size-swatch-wrapper');
    if(!sizeVariantWrapper){
      return;
    }

    const sizeLabelCollection = sizeVariantWrapper.querySelectorAll('label');

    sizeLabelCollection.forEach(label => {
      const labelValue = label.innerHTML.split('-');
      label.innerHTML = '';

      labelValue.forEach(value => {
        const createSpan = document.querySelector('span');
        createSpan.innerHTML = value;
        createSpan.removeAttribute('class');
        label.append(createSpan)
      });

    })
  }

  updateOptionsMap() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));

    this.optionsMap = {};
    for (const fieldset of fieldsets) {
      const checkedInput = Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked);
      const optionHandle = checkedInput.dataset.optionHandle;

      this.optionsMap[optionHandle] = {
        value: checkedInput.value
      }
    }
  }

  updateAtcButtonPrice(event) {
    if (!this.currentVariant) {
      return;
    }

    const data = event.data;

    const productForm = this.getProductForm();
    const buttonPrices = [
      {
        price: this.currentVariant.price,
        elm: productForm.querySelector('.price-item--last')
      },
      {
        price: this.currentVariant.compare_at_price || 0,
        elm: productForm.querySelector('.price-item--regular')
      }
    ];

    buttonPrices.forEach((item) => {
      if (item.elm && item.price) {
        item.elm.innerText = Shopify.formatMoney(item.price * data.qty);
      }
    });
  }

  updateAtcButton(event) {
    const data = event.data;
    const html = data.html;
    const formSource = html.getElementById(`product-form-${this.dataset.section}`);
    const formDest = this.getProductForm();
    if (!formSource || !formDest) {
      return;
    }

    const submitButtonSource = formSource.querySelector('[name=add]');
    const submitButtonDest = formDest.querySelector('[name=add]');

    if (submitButtonDest) {
      submitButtonDest.innerHTML = submitButtonSource ? submitButtonSource.innerHTML : '';
    }
  }

  getProductForm() {
    if (!this.productForm) {
      this.productForm = document.getElementById(`product-form-${this.dataset.section}`);
    }

    return this.productForm;
  }
}

customElements.define('product-variant-swatches', ProductVariantSwatches);
