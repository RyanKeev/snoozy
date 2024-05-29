

    // Function to compute the discount percentage
    function computeDiscountPercentage(originalPrice, discountedPrice) {
      const difference = originalPrice - discountedPrice;
      const percentage = (difference / originalPrice) * 100;
      return Math.round(percentage);
    }
  
    function updatePrices() {
      const moneyPrice = document.querySelector('.price .one-quantity').textContent;
      const discount10 = document.querySelector('.price .two-less-four-quantity').textContent;
      const discount25 = document.querySelector('.price .four-or-more-quantity').textContent;
  
        // Update the variant data element with the retrieved prices
        const variantData = document.getElementById('variant-data');
        if (!variantData) {
            console.log('Variant data element not found.');
            return;
        }
  
        variantData.setAttribute('data-money-price', moneyPrice);
        variantData.setAttribute('data-discount-10-money', discount10);
        variantData.setAttribute('data-discount-25-money', discount25);
  
        // Update the displayed prices in the bundle DOM
        document.querySelector('.pr-one-quantity').textContent = moneyPrice;
        document.querySelector('.pr-two-less-four-quantity').textContent = discount10;
        document.querySelector('.pr-four-or-more-quantity').textContent = discount25;
  
        document.dispatchEvent(new CustomEvent('price:update'));
    }
  
    // Function to update the price display based on quantity
    function updatePriceDisplay(quantity) {
        const oneQuantityElement = document.querySelector('.one-quantity');
        const twoLessFourQuantityElement = document.querySelector('.two-less-four-quantity');
        const fourOrMoreQuantityElement = document.querySelector('.four-or-more-quantity');
  
        if (!oneQuantityElement || !twoLessFourQuantityElement || !fourOrMoreQuantityElement) {
            console.log('One or more quantity elements not found.');
            return;
        }
  
        oneQuantityElement.style.display = quantity === 1 ? 'inline-block' : 'none';
        twoLessFourQuantityElement.style.display = quantity >= 2 && quantity < 4 ? 'inline-block' : 'none';
        fourOrMoreQuantityElement.style.display = quantity >= 4 ? 'inline-block' : 'none';
          
        updateDiscountPercentage();
      }
  
    // Function to update the discount percentage display
    function updateDiscountPercentage() {
      const originalPriceElement = document.querySelector('.price-item.price-item--regular.orig-price');
  
      if (!originalPriceElement) {
          console.log('Original price element not found.');
          return;
      }
  
      const originalPrice = parseFloat(originalPriceElement.textContent.trim().replace(/[^\d.]/g, ''));
      let discountedPrice;
  
      const oneQuantityElement = document.querySelector('.one-quantity');
      const twoLessFourQuantityElement = document.querySelector('.two-less-four-quantity');
      const fourOrMoreQuantityElement = document.querySelector('.four-or-more-quantity');
  
      if (oneQuantityElement.style.display === 'inline-block') {
          discountedPrice = parseFloat(oneQuantityElement.textContent.trim().replace(/[^\d.]/g, ''));
      } else if (twoLessFourQuantityElement.style.display === 'inline-block') {
          discountedPrice = parseFloat(twoLessFourQuantityElement.textContent.trim().replace(/[^\d.]/g, ''));
      } else if (fourOrMoreQuantityElement.style.display === 'inline-block') {
          discountedPrice = parseFloat(fourOrMoreQuantityElement.textContent.trim().replace(/[^\d.]/g, ''));
      }
  
      if (originalPrice && discountedPrice) {
          const discountPercentage = computeDiscountPercentage(originalPrice, discountedPrice);
          const discountSaleSpan = document.getElementById('discount-sale');
          if (discountSaleSpan) {
              discountSaleSpan.textContent = `${discountPercentage}% OFF`;
          }
      }
    }
  
    // Function to set the bundle swatch to quantity 1
    function setDefaultBundleSwatch() {
      const defaultQuantityInput = document.querySelector('input[name="quantity"][value="1"]');
      if (defaultQuantityInput) {
        defaultQuantityInput.checked = true;
        defaultQuantityInput.dispatchEvent(new Event('change'));
      }
    }
  
    // Function to attach event listeners to quantity inputs
    function attachQuantityListeners() {
        const quantityInputs = document.querySelectorAll('input[name="quantity"]');
        quantityInputs.forEach(input => {
            input.addEventListener('change', () => {
                updatePrices(); // Update prices when quantity changes
                updatePriceDisplay(parseInt(input.value, 10));
            });
        });
    }
  
    // Reinitialize on custom variant change event
    document.addEventListener('variant:change', () => {
        setDefaultBundleSwatch(); // Set bundle swatch to 1 on variant change
        updatePrices(); // Ensure prices are updated on variant change
        attachQuantityListeners(); // Reattach listeners to handle any DOM changes
    });
  
    // Function to initialize quantity listeners and reinitialize on variant change
    function initializeQuantityListeners() {
        attachQuantityListeners();
        updatePrices(); // Ensure prices are updated on variant change
    }
  
    // Initialize listeners on DOM content load
    document.addEventListener('DOMContentLoaded', () => {
        initializeQuantityListeners();
        updatePrices();
    });
