
  function handlePinInput(input) {
    // Allow only numbers and restrict max length to 6
    input.value = input.value.replace(/\D/g, '').slice(0, 6);
    
    const btn = document.getElementById('tulia-check-btn');
    const responseDiv = document.getElementById('tulia-pin-response');
    
    // Hide the response as well when the input is cleared or below 6 digits
    if (input.value.length < 6) {
      responseDiv.style.display = 'none';
    }

    // Once exactly 6 digits are entered, enable the button with the brand color #420007
    if (input.value.length === 6) {
      btn.removeAttribute('disabled');
      btn.style.background = '#420007';
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
    } else {
      // Keep the button disabled below 6 digits
      btn.setAttribute('disabled', 'true');
      btn.style.background = '#b5a89e';
      btn.style.cursor = 'not-allowed';
      btn.style.opacity = '0.7';
    }
  }

  async function tuliaCheckPincode() {
    const pincode = document.getElementById('tulia-pin-input').value.trim();
    const responseDiv = document.getElementById('tulia-pin-response');
    
    // 1. Basic format check (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      responseDiv.style.display = 'block';
      responseDiv.style.color = '#c92a2a';
      responseDiv.innerHTML = '❌ Please enter a valid 6-digit pincode.';
      return;
    }

    // Loading state
    responseDiv.style.display = 'block';
    responseDiv.style.color = '#5a4a42';
    responseDiv.innerHTML = '⏳ Checking availability...';

    // MASTER PINCODE SETTINGS
    const pincodeRules = {
      '110001': { status: 'block', days: '' }, 
      '400001': { status: 'prepaid', days: '2-3' }, 
      '560001': { status: 'all', days: '1-2' },    
      '700001': { status: 'all', days: '6-7' },    
      '395003': { status: 'prepaid', days: '3-4' }
    };

    const defaultSetting = { status: 'all', days: '3-5' };
    const currentRule = pincodeRules[pincode] ? pincodeRules[pincode] : defaultSetting;

    // 3. Rule: BLOCK
    if (currentRule.status === 'block') {
      responseDiv.style.color = '#c92a2a';
      responseDiv.innerHTML = '❌ <strong>Order Not Available!</strong> Sorry, we currently do not deliver to this specific location.';
      return;
    }

    try {
      // 4. Checking valid/invalid PIN codes using API
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data[0].Status === "Error" || !data[0].PostOffice) {
        responseDiv.style.color = '#c92a2a';
        responseDiv.innerHTML = '❌ <strong>Invalid Pincode!</strong> This pincode does not exist in India.';
        return;
      }

      const districtName = data[0].PostOffice[0].District;

      // 5. Rule: PREPAID ONLY
      if (currentRule.status === 'prepaid') {
        responseDiv.style.color = '#e67e22';
        responseDiv.innerHTML = `✨ <strong>Delivery Available to ${districtName}!</strong><br><span style="color:#555;">• Estimated delivery: <strong>${currentRule.days} business days</strong>.<br>• <strong style="color:#c92a2a;">COD is NOT available</strong> for this pincode. Only Prepaid orders accepted.</span>`;
        return;
      }

      // 6. Rule: ALL AVAILABLE
      responseDiv.style.color = '#2b8a3e';
      responseDiv.innerHTML = `✨ <strong>Delivery Available to ${districtName}!</strong><br><span style="color:#555;">• Estimated delivery: <strong>${currentRule.days} business days</strong>.<br>• Cash on Delivery (COD) is available.</span>`;

    } catch (error) {
      if (currentRule.status === 'prepaid') {
        responseDiv.style.color = '#e67e22';
        responseDiv.innerHTML = `✨ <strong>Delivery Available!</strong><br><span style="color:#555;">• Estimated delivery: <strong>${currentRule.days} business days</strong>.<br>• Prepaid Only (COD not available).</span>`;
      } else {
        responseDiv.style.color = '#2b8a3e';
        responseDiv.innerHTML = `✨ <strong>Delivery Available!</strong><br><span style="color:#555;">• Estimated delivery: <strong>${currentRule.days} business days</strong>.<br>• COD available.</span>`;
      }
    }
  }
