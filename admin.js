(async () => {
  // ───────────── CONFIGURATION ─────────────
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log('[ADMIN]', ...args);

  const PRODUCTS_API = `${window.API_ROOT}/products`;
  const BRAND_API = `${window.API_ROOT}/brand`;
  const UPLOAD_URL = `${window.API_ROOT}/upload-image`;

  log('Admin JS bootstrapping. API_ROOT =', window.API_ROOT);

  const sessionReady = (async () => {
    if (typeof window.checkSession === 'function') {
      await window.checkSession();
    }

    const current = typeof window.getCurrentUser === 'function'
      ? window.getCurrentUser()
      : null;

    if (!current || (current.role !== 'admin' && current.role !== 'super_admin')) {
      showToast('Access denied. Please sign in as a super admin.', { type: 'error' });
      window.location.href = 'signin.html';
      throw new Error('Admin session missing');
    }

    return current;
  })();

  // ───────────── DOM ELEMENT REFERENCES ─────────────
  const customerDisplay = document.getElementById('customerDisplay');
  
  // --- Navigation Buttons ---
  const showProductsBtn = document.getElementById('showProductsBtn');
  const showBrandBtn = document.getElementById('showBrandBtn');
  const showImagesBtn = document.getElementById('showImagesBtn'); // NEW
  const showTextsBtn = document.getElementById('showTextsBtn'); // NEW
  const showWinningProductsBtn = document.getElementById('showWinningProductsBtn'); // ADD THIS
  const showContentHubBtn = document.getElementById('showContentHubBtn'); // ADD THIS
  const showVideoCreatorBtn = document.getElementById('showVideoCreatorBtn'); // ADD THIS


  // --- Views ---
  const productsView = document.getElementById('productsView');
  const brandView = document.getElementById('brandView');
  const imagesView = document.getElementById('imagesView'); // NEW
  const textsView = document.getElementById('textsView'); // NEW
  const winningProductsView = document.getElementById('winningProductsView'); // ADD THIS
  const contentHubView = document.getElementById('contentHubView'); // ADD THIS
  const videoCreatorView = document.getElementById('videoCreatorView'); // ADD THIS


  // --- Product Elements ---
  const productSelect = document.getElementById('productSelect');
  const addProductBtn = document.getElementById('addProductBtn');
  const formContainer = document.getElementById('formContainer');

  // --- Brand Elements ---
  const brandForm = document.getElementById('brandForm');
  const brandFormMsg = document.getElementById('brandFormMsg');

  // --- Text Elements ---
  const textsForm = document.getElementById('textsForm'); // NEW
  const textsFormMsg = document.getElementById('textsFormMsg'); // NEW





  if (customerDisplay) customerDisplay.textContent = window.customerId;

  // ───────────── HELPER FUNCTIONS ─────────────
  async function fetchJSON(url, opts = {}) {
      await sessionReady;
      log('fetchJSON →', url, opts);
      opts.credentials = opts.credentials || 'include';

      const res = await fetch(url, opts);
      log('fetchJSON ← status', res.status, res.statusText);

      // --- NEW: Handle session timeout ---
      if (res.status === 401) {
          // 401 Unauthorized means the session is invalid or expired.
          showToast('Your session has expired. Please sign in again.', { type: 'warning' });
          window.location.href = 'signin.html'; // Redirect to the login page
          // Throw an error to stop the original function from continuing
          throw new Error("Session expired"); 
      }

      let data;
      try {
        data = await res.json();
        log('fetchJSON ← body', data);
      } catch (e) {
        log('fetchJSON ← no‑json body');
      }

      if (!res.ok) {
          const errorMsg = data?.error || `${res.status} ${res.statusText}`;
          throw new Error(errorMsg);
      }
      return data;
  }

  // Make the video product dropdown loader available before any handlers use it
  async function loadProductsIntoSelector() {
    const videoProductSelect = document.getElementById('video-product-select');
    if (!videoProductSelect) return;

    try {
      if (!window.allProducts || window.allProducts.length === 0) {
        window.allProducts = await fetchJSON(PRODUCTS_API);
      }
    } catch (err) {
      console.error('Video creator: failed to fetch products', err);
      return;
    }

    window.allProducts.forEach(product => {
      const rawPaths = product.product_imagePath;
      if (Array.isArray(rawPaths)) return;
      if (typeof rawPaths === 'string') {
        try {
          const parsed = JSON.parse(rawPaths);
          if (Array.isArray(parsed)) {
            product.product_imagePath = parsed;
            return;
          }
        } catch (_) {
          // ignore JSON parse errors and fall through to defaulting below
        }
      }
      if (!Array.isArray(product.product_imagePath)) {
        product.product_imagePath = [];
      }
    });

    videoProductSelect.innerHTML = '<option value="">-- Select a Product --</option>';
    window.allProducts.forEach(product => {
      const option = document.createElement('option');
      option.value = product.product_id;
      option.textContent = product.product_name;
      videoProductSelect.appendChild(option);
    });
  }

  // =================================================================
  // ====== 1. NAVIGATION LOGIC ======
  // =================================================================

// =================================================================
  // ====== 1. NAVIGATION LOGIC ======
  // =================================================================

  // This one function will now control all view switching
  function setActiveView(activeBtn, activeView) {
      const allBtns = [showProductsBtn, showBrandBtn, showImagesBtn, showTextsBtn, showWinningProductsBtn, showContentHubBtn, showVideoCreatorBtn];
      const allViews = [productsView, brandView, imagesView, textsView, winningProductsView, contentHubView, videoCreatorView];

      // First, hide everything
      allViews.forEach(view => view.style.display = 'none');
      allBtns.forEach(btn => btn.classList.remove('active'));

      // Then, show only the active ones
      activeView.style.display = 'block';
      activeBtn.classList.add('active');
  }

  // Now, each button just calls the helper function
  showProductsBtn.addEventListener('click', () => setActiveView(showProductsBtn, productsView));
  
  showBrandBtn.addEventListener('click', () => {
      setActiveView(showBrandBtn, brandView);
      loadAndDisplayBrandInfo(); // Also load brand info
  });

  showImagesBtn.addEventListener('click', () => {
      setActiveView(showImagesBtn, imagesView);
      if (typeof window.loadAndDisplayBrandImages === 'function') {
          window.loadAndDisplayBrandImages();
      }
  });

  showTextsBtn.addEventListener('click', () => {
      setActiveView(showTextsBtn, textsView);
      loadAndDisplayPageTexts();
  });

  showWinningProductsBtn.addEventListener('click', () => setActiveView(showWinningProductsBtn, winningProductsView));
  
  showContentHubBtn.addEventListener('click', () => setActiveView(showContentHubBtn, contentHubView));
  
  showVideoCreatorBtn.addEventListener('click', () => {
      setActiveView(showVideoCreatorBtn, videoCreatorView);
      loadProductsIntoSelector(); // Also load products for the video creator
  });
  // =================================================================
  // ====== 2. BRAND INFO MANAGEMENT ======
  // =================================================================

  async function loadAndDisplayBrandInfo() {
    brandFormMsg.textContent = 'Loading...';
    brandFormMsg.className = 'form-message';
    try {
      const brandData = await fetchJSON(BRAND_API);
      for (const key in brandData) {
        const input = brandForm.querySelector(`[name="${key}"]`);
        if (input) {
          input.value = brandData[key] || '';
        }
      }
      brandFormMsg.textContent = 'Brand info loaded.';
      brandFormMsg.classList.add('success');
    } catch (error) {
        if (error.message.includes('404')) {
             brandFormMsg.textContent = 'No brand info found. Fill out the form to create it.';
             brandForm.reset();
        } else {
            console.error('Error loading brand info:', error);
            brandFormMsg.textContent = `Error: ${error.message}`;
            brandFormMsg.className = 'form-message error';
        }
    }
  }

  brandForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    brandFormMsg.textContent = 'Saving...';
    brandFormMsg.className = 'form-message';
    const formData = new FormData(brandForm);
    const data = Object.fromEntries(formData.entries());

    try {
      await fetchJSON(BRAND_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      brandFormMsg.textContent = 'Brand information saved successfully!';
      brandFormMsg.className = 'form-message success';
    } catch (error) {
      console.error('Error saving brand info:', error);
      brandFormMsg.textContent = `Error: ${error.message}`;
      brandFormMsg.className = 'form-message error';
    }
  });

  async function loadAndDisplayPageTexts() {
    textsFormMsg.textContent = 'Loading...';
    textsFormMsg.className = 'form-message';
    try {
      const brandData = await fetchJSON(BRAND_API);
      const texts = brandData.brand_indexPageTexts || {}; // Default to empty object

      // Loop through all the text fields in our form
      textsForm.querySelectorAll('input[type="text"], textarea').forEach(input => {
        const key = input.name;
        if (texts[key]) {
          input.value = texts[key];
        } else {
          input.value = ''; // Clear the field if no data exists for it
        }
      });
      
      textsFormMsg.textContent = 'Page texts loaded.';
      textsFormMsg.classList.add('success');
    } catch (error) {
        if (error.message.includes('404')) {
             textsFormMsg.textContent = 'No page texts found. Fill out the form to create them.';
             textsForm.reset();
        } else {
            console.error('Error loading page texts:', error);
            textsFormMsg.textContent = `Error: ${error.message}`;
            textsFormMsg.className = 'form-message error';
        }
    }
  }

  textsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    textsFormMsg.textContent = 'Saving...';
    textsFormMsg.className = 'form-message';

    try {
      // 1. Fetch the most recent, complete brand data object
      const currentBrandData = await fetchJSON(BRAND_API).catch(() => ({}));
      
      // 2. Create an object to hold all the new text values from the form
      const newTexts = {};
      const formData = new FormData(textsForm);
      for (const [key, value] of formData.entries()) {
        newTexts[key] = value;
      }
      
      // 3. Create the final payload by merging the old data with the new texts
      const payload = {
          ...currentBrandData, // Keep all existing brand data
          brand_indexPageTexts: newTexts // Overwrite just the text part
      };

      // Remove rowid as it's not a real column
      delete payload.rowid;
      
      // 4. Send the complete object to the server
      await fetchJSON(BRAND_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      textsFormMsg.textContent = 'Page texts saved successfully!';
      textsFormMsg.className = 'form-message success';
    } catch (error) {
      console.error('Error saving page texts:', error);
      textsFormMsg.textContent = `Error: ${error.message}`;
      textsFormMsg.className = 'form-message error';
    }
  });


  

  // =================================================================
  // ====== 3. PRODUCT MANAGEMENT ======
  // =================================================================
// Add this function at the top of the Product Management section
 // Add this function at the top of the Product Management section
  function generateProductId() {
    // Generates a random 6-digit number
    return Math.floor(100000 + Math.random() * 900000);
  }
  const IMAGE_FIELD = 'product_imagePath';
  const imageListEl = document.createElement('div');
  imageListEl.id = 'imageList';
  imageListEl.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px;';
  
  const navBar = document.createElement('div');
  navBar.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; padding: 0;';
  const moveLeftBtn = document.createElement('button');
  moveLeftBtn.type = 'button';
  moveLeftBtn.textContent = '◀';
  const moveRightBtn = document.createElement('button');
  moveRightBtn.type = 'button';
  moveRightBtn.textContent = '▶';
  [moveLeftBtn, moveRightBtn].forEach(btn => btn.style.cssText = 'font-size: 18px; line-height: 1; padding: 4px 8px; border: 1px solid #aaa; background: #f5f5f5; cursor: pointer;');
  navBar.append(moveLeftBtn, moveRightBtn);
  
  const previewEl = document.createElement('img');
  previewEl.id = 'imagePreview';
  previewEl.style.cssText = 'width: 400px; height: 400px; object-fit: contain; border: 1px solid #ccc; margin-top: 8px; display: none; background: #fafafa;';
  
  let selectedWrap = null;
  
  moveLeftBtn.addEventListener('click', () => {
    if (selectedWrap?.previousElementSibling) imageListEl.insertBefore(selectedWrap, selectedWrap.previousElementSibling);
  });
  
  moveRightBtn.addEventListener('click', () => {
    if (selectedWrap?.nextElementSibling) imageListEl.insertBefore(selectedWrap, selectedWrap.nextElementSibling.nextSibling);
  });
  
  function addThumb(path) {
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    const img = document.createElement('img');
    
    img.src = path;
    img.dataset.path = path;
    img.style.cssText = 'max-width: 100px; cursor: move;';
    img.draggable = true;
  
    img.addEventListener('dragstart', ev => ev.dataTransfer.setData('text/plain', path));
    wrap.addEventListener('dragover', ev => ev.preventDefault());
    wrap.addEventListener('drop', ev => {
      ev.preventDefault();
      const draggedPath = ev.dataTransfer.getData('text/plain');
      const draggedImg = imageListEl.querySelector(`img[data-path="${draggedPath}"]`);
      if (draggedImg) imageListEl.insertBefore(draggedImg.parentElement, wrap);
    });
  
    const del = document.createElement('span');
    del.textContent = '✕';
    del.style.cssText = 'position:absolute;top:-6px;right:-6px;background:#fff;border:1px solid #999;border-radius:50%;padding:0 6px;cursor:pointer;font-size:11px;';
    del.onclick = () => {
      if (wrap === selectedWrap) {
        selectedWrap = null;
        previewEl.style.display = 'none';
      }
      wrap.remove();
    };
  
    img.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      if (selectedWrap) selectedWrap.style.outline = '';
      selectedWrap = wrap;
      wrap.style.outline = '2px solid #007bff';
      previewEl.src = img.src;
      previewEl.style.display = 'block';
    });
  
    wrap.append(img, del);
    imageListEl.appendChild(wrap);
    if (previewEl.style.display === 'none') {
        previewEl.src = img.src;
        previewEl.style.display = 'block';
    }
  }
  
  function gatherImagePaths() {
    return [...imageListEl.querySelectorAll('img')].map(i => i.dataset.path);
  }
  
    
  let cols = [], firstCol, secondCol;
  window.allProducts = [];
  
  async function getSchema() {
    log('Fetching product schema');
    return fetchJSON(PRODUCTS_API + '/schema');
  }
  
  async function initProducts() {
    log('initProducts() start');
    window.allProducts = await fetchJSON(PRODUCTS_API);    log('initProducts() fetched products:', allProducts);
    if (window.allProducts.length > 0) {
        cols = Object.keys(window.allProducts[0]).filter(k => k !== 'rowid');
    } else {
      cols = await getSchema();
    }
    firstCol = "product_name";
    secondCol = "product_id";
    log('initProducts() columns derived:', cols);
    populateSelect(window.allProducts); 
   }
  
  function populateSelect(products) {
    log('populateSelect()', products);
    productSelect.innerHTML = '<option value="">-- Select Product --</option>';
    products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.product_id;
      opt.textContent = `${p[firstCol]} | ${p[secondCol]}`;
      productSelect.appendChild(opt);
    });
  }
  
  function renderForm(data = {}) {
    log('renderForm()', data);
    previewEl.src = '';
    previewEl.style.display = 'none';
    selectedWrap = null;
  
    formContainer.innerHTML = '';
    cols.forEach(c => {
      const label = document.createElement('label');
      label.textContent = c;


      if (c === 'product_host') {
          const select = document.createElement('select');
          select.name = 'product_host';
          select.innerHTML = `
              <option value="self">Self-Hosted</option>
              <option value="amazon">Amazon</option>
              <option value="aliexpress">AliExpress</option>
          `;
          select.value = data[c] || 'self';
          
          // Add event listener to show/hide the host ID field
          select.addEventListener('change', () => {
              const hostIdField = document.querySelector('[name="product_host_productID"]');
              if (hostIdField) {
                  hostIdField.parentElement.style.display = select.value === 'self' ? 'none' : 'block';
              }
          });

          label.appendChild(select);
          formContainer.appendChild(label);
          return; // Continue to next column
      }

      if (c === 'product_host_productID') {
          const input = document.createElement('input');
          input.name = c;
          input.value = data[c] || '';
          label.appendChild(input);
          formContainer.appendChild(label);
          // Hide this field by default if host is 'self'
          if (!data.product_host || data.product_host === 'self') {
              label.style.display = 'none';
          }
          return; // Continue to next column
      }


      if (c === IMAGE_FIELD) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/png,image/jpeg';
        fileInput.multiple = true;
        fileInput.name = 'imagesUploader';
        imageListEl.innerHTML = '';


        const paths = data[c]; 
        if (Array.isArray(paths)) {
            paths.forEach(p => addThumb(p));
        }

        
        fileInput.addEventListener('change', async () => {
          for (const file of fileInput.files) {
            const fd = new FormData();
            fd.append('file', file);
            try {
              const up = await fetchJSON(UPLOAD_URL, { method: 'POST', body: fd });
              addThumb(up.path);
            } catch (e) {
              showToast(`Upload failed. ${e?.message || ''}`.trim(), { type: 'error' });
            }
          }
          fileInput.value = '';
        });
        label.appendChild(fileInput);
        label.appendChild(imageListEl);
        label.appendChild(navBar);
        label.appendChild(previewEl);
      } else if (c === 'product_table') {
          // NEW LOGIC FOR THE SPECIFICATIONS TABLE
          const tableContainer = document.createElement('div');
          tableContainer.className = 'product-table-container';

          const rowsContainer = document.createElement('div');
          rowsContainer.className = 'product-table-rows';

          const addRowBtn = document.createElement('button');
          addRowBtn.type = 'button';
          addRowBtn.textContent = '+ Add Specification';
          addRowBtn.style.maxWidth = '200px';

          const addTableRow = (key = '', value = '') => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.gap = '10px';
            row.style.marginBottom = '5px';

            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.className = 'product-table-key';
            keyInput.placeholder = 'Specification Name (e.g., Color)';
            keyInput.value = key;

            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.className = 'product-table-value';
            valueInput.placeholder = 'Specification Value (e.g., Red)';
            valueInput.value = value;
            
            const removeRowBtn = document.createElement('button');
            removeRowBtn.type = 'button';
            removeRowBtn.textContent = '✕';
            removeRowBtn.style.width = 'auto';
            removeRowBtn.onclick = () => row.remove();

            row.append(keyInput, valueInput, removeRowBtn);
            rowsContainer.appendChild(row);
          };

          addRowBtn.onclick = () => addTableRow();

          // Populate existing data if it exists
          if (data[c]) {
            try {
              const specs = JSON.parse(data[c]);
              for (const key in specs) {
                addTableRow(key, specs[key]);
              }
            } catch (e) {
              console.error('Could not parse product_table JSON:', data[c]);
              addTableRow(); // Add one empty row as a fallback
            }
          }

          tableContainer.append(rowsContainer, addRowBtn);
          label.appendChild(tableContainer);
          
      } else if (c === 'product_description') {
          // NEW: Use a <textarea> for the description field
          const textarea = document.createElement('textarea');
          textarea.name = c;
          textarea.value = data[c] || '';
          textarea.rows = 5; // You can adjust the default height
          textarea.style.height = 'auto'; // Allows it to grow if needed
          label.appendChild(textarea);
      } else if (c === 'product_options') {
    // === NEW LOGIC FOR DYNAMIC PRODUCT OPTIONS ===
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'product-options-container';

    // --- Helper function to create a single choice tag/pill ---
    const createChoiceTag = (text, tagsContainer) => {
        const tag = document.createElement('span');
        tag.className = 'choice-tag';
        tag.textContent = text.trim();
        tag.style.cssText = 'display: inline-flex; align-items: center; background: #e0e0e0; padding: 3px 8px; border-radius: 12px; margin: 2px;';
        
        const removeTagBtn = document.createElement('button');
        removeTagBtn.type = 'button';
        removeTagBtn.textContent = '✕';
        removeTagBtn.style.cssText = 'border: none; background: none; margin-left: 5px; cursor: pointer; font-size: 12px;';
        removeTagBtn.onclick = () => tag.remove();
        
        tag.appendChild(removeTagBtn);
        tagsContainer.appendChild(tag);
    };

    // --- Helper function to create an entire option row (e.g., for "Color") ---
    const addOptionRow = (name = '', choices = []) => {
        const group = document.createElement('div');
        group.className = 'product-option-group';
        group.style.cssText = 'background: #f9f9f9; border: 1px solid #eee; padding: 10px; margin-bottom: 10px; border-radius: 4px;';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'product-option-name';
        nameInput.placeholder = 'Option Name (e.g., Color)';
        nameInput.value = name;
        nameInput.style.marginBottom = '5px';

        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        tagsContainer.style.marginBottom = '5px';
        
        // Populate existing choices
        choices.forEach(choice => createChoiceTag(choice, tagsContainer));

        const newChoiceContainer = document.createElement('div');
        newChoiceContainer.style.cssText = 'display: flex; gap: 5px;';
        
        const newChoiceInput = document.createElement('input');
        newChoiceInput.type = 'text';
        newChoiceInput.className = 'new-choice-input';
        newChoiceInput.placeholder = 'Add a choice (e.g., Red)';

        const addChoiceBtn = document.createElement('button');
        addChoiceBtn.type = 'button';
        addChoiceBtn.textContent = '+';
        addChoiceBtn.style.width = 'auto';

        const addChoiceAction = () => {
            const choiceText = newChoiceInput.value.trim();
            if (choiceText) {
                createChoiceTag(choiceText, tagsContainer);
                newChoiceInput.value = '';
                newChoiceInput.focus();
            }
        };

        addChoiceBtn.onclick = addChoiceAction;
        newChoiceInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addChoiceAction();
            }
        };

        const removeGroupBtn = document.createElement('button');
        removeGroupBtn.type = 'button';
        removeGroupBtn.textContent = 'Remove Option';
        removeGroupBtn.style.marginTop = '5px';
        removeGroupBtn.onclick = () => group.remove();

        newChoiceContainer.append(newChoiceInput, addChoiceBtn);
        group.append(nameInput, tagsContainer, newChoiceContainer, removeGroupBtn);
        optionsContainer.appendChild(group);
    };

    // --- Main button to add a new option type ---
    const addOptionBtn = document.createElement('button');
    addOptionBtn.type = 'button';
    addOptionBtn.textContent = 'Add New Option Type';
    addOptionBtn.style.maxWidth = '250px';
    addOptionBtn.onclick = () => addOptionRow();
    
    // Parse and display existing options data
    if (data[c]) {
        try {
            const optionsData = JSON.parse(data[c]);
            for (const name in optionsData) {
                if (Array.isArray(optionsData[name])) {
                    addOptionRow(name, optionsData[name]);
                }
            }
        } catch (e) { console.error('Could not parse product_options JSON:', data[c]); }
    }

    // Add everything to the main form label
    label.append(optionsContainer, addOptionBtn);
  }else {
        const input = document.createElement('input');
        input.name = c;
        input.value = data[c] || '';
        if (c === 'product_id') {
          input.readOnly = true;
        }
        label.appendChild(input);
      }
      formContainer.appendChild(label);
    });
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', saveRecord);
    formContainer.appendChild(saveBtn);
    
    if (data.product_id) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', deleteRecord);
      formContainer.appendChild(deleteBtn);
    }
  }
  
  async function saveRecord() {
    let productId = productSelect.value;
    const payload = {};
    
    cols.forEach(c => {
        if (c === IMAGE_FIELD) {
            payload[c] = JSON.stringify(gatherImagePaths());
        } else if (c === 'product_table') {
            // NEW LOGIC TO GATHER TABLE DATA
            const specs = {};
            const rows = formContainer.querySelectorAll('.product-table-rows > div');
            rows.forEach(row => {
                const key = row.querySelector('.product-table-key')?.value.trim();
                const value = row.querySelector('.product-table-value')?.value.trim();
                if (key) { // Only save if a key is provided
                    specs[key] = value;
                }
            });
            payload[c] = JSON.stringify(specs);
        } else if (c === 'product_options') {
          // === NEW LOGIC TO GATHER OPTIONS DATA ===
          const optionsData = {};
          const groups = formContainer.querySelectorAll('.product-option-group');

          groups.forEach(group => {
              const name = group.querySelector('.product-option-name')?.value.trim();
              if (name) {
                  const choices = [];
                  const tags = group.querySelectorAll('.choice-tag');
                  tags.forEach(tag => {
                      // The text content of the span is the value, ignoring the remove button's '✕'
                      choices.push(tag.firstChild.textContent.trim());
                  });
                  optionsData[name] = choices;
              }
          });

          payload[c] = JSON.stringify(optionsData);
      }else {
            // This is the default logic for regular inputs
            const input = formContainer.querySelector(`[name="${c}"]`);
            if (input) {
                payload[c] = input.value;
            }
        }
    });
    
    try {
      if (productId) {
        await fetchJSON(`${PRODUCTS_API}/${productId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        const res = await fetchJSON(PRODUCTS_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        productId = res.product_id;
      }
      
      allProducts = await fetchJSON(PRODUCTS_API);
      populateSelect(allProducts);
      productSelect.value = productId;
      
      const updatedProduct = allProducts.find(p => p.product_id === productId);
      if (updatedProduct) {
          renderForm(updatedProduct);
      }
  
    } catch (e) {
      showToast(`We couldn't save those changes. ${e?.message || ''}`.trim(), { type: 'error' });
    }
  }
  
  async function deleteRecord() {
    const productId = productSelect.value;
    if (!productId || !confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetchJSON(`${PRODUCTS_API}/${productId}`, { method: 'DELETE' });
      
      allProducts = await fetchJSON(PRODUCTS_API);
      populateSelect(allProducts);
      productSelect.value = '';
      renderForm();
  
    } catch (e) {
      showToast(`We couldn't delete that item. ${e?.message || ''}`.trim(), { type: 'error' });
    }
  }
  
  productSelect.addEventListener('change', async () => {
    const id = productSelect.value;
    if (!id) {
      renderForm();
      return;
    }
    try {
      const product = allProducts.find(p => p.product_id === id);
      if (product) {
          renderForm(product);
      } else {
          throw new Error("Product not found in local cache.");
      }
    } catch (e) {
      showToast(`We couldn't load that product. ${e?.message || ''}`.trim(), { type: 'error' });
    }
  });
  
  addProductBtn.addEventListener('click', () => {
    log('addBtn clicked → new record');
    productSelect.value = '';
    
    // Generate a new product ID and pass it to the form
    const newId = `prod_${generateProductId()}`;
    renderForm({ product_id: newId }); 
  });
  // =================================================================
  // ====== 4. INITIALIZATION ======
  // =================================================================
  try {
    await sessionReady;
    await initProducts();
  } catch (e) {
    log('Initialization failed', e);
    console.error('Init error:', e);
    showToast(`Admin panel failed to initialize. ${e?.message || ''}`.trim(), { type: 'error' });
  }



// admin.js

  // ... (all of your existing product management code is here) ...

// admin.js

  function copyText(textElementId, hashtagElementId = null, buttonElement) {
    const textElem = document.getElementById(textElementId);
    let fullText = textElem.value;

    if (hashtagElementId) {
      const hashtagElem = document.getElementById(hashtagElementId);
      if (hashtagElem.value) {
        fullText += "\n\n" + hashtagElem.value; // Add hashtags on new lines
      }
    }

    navigator.clipboard.writeText(fullText).then(() => {
      const originalText = buttonElement.textContent;
      buttonElement.textContent = 'Copied!';
      setTimeout(() => {
          buttonElement.textContent = originalText;
      }, 2000); // Revert back after 2 seconds
    }).catch(err => {
      showToast("We couldn't copy that text. Please try again.", { type: 'error' });
      console.error('Copy to clipboard failed: ', err);
    });
  }
  // admin.js

// ... (your copyText function is here) ...

  async function handleAiEdit(platform, buttonElement) {
      const platformPrefix = {
          facebook: 'fb',
          instagram: 'ig',
          tiktok: 'tt'
      }[platform];

      const textElem = document.getElementById(`${platformPrefix}-text`);
      const hashtagElem = document.getElementById(`${platformPrefix}-hashtags`);
      let fullText = textElem.value;

      if (hashtagElem && hashtagElem.value) {
          fullText += "\n\nHashtags:\n" + hashtagElem.value;
      }

      if (!fullText.trim()) {
          showToast('Add some content before using AI Edit.', { type: 'info' });
          return;
      }

      // Show loading state
      const originalText = buttonElement.textContent;
      buttonElement.textContent = 'Editing...';
      buttonElement.disabled = true;

      try {
          const response = await fetch(`${API_ROOT}/ai-edit-post`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                  platform: platform,
                  text: fullText
              })
          });

          const result = await response.json();
          if (!response.ok) {
              throw new Error(result.error || 'Failed to edit text.');
          }

          // Update the textarea with the AI-edited content
          textElem.value = result.edited_text;

      } catch (err) {
          showToast(`We couldn't complete that request. ${err?.message || ''}`.trim(), { type: 'error' });
      } finally {
          // Reset button state
          buttonElement.textContent = originalText;
          buttonElement.disabled = false;
      }
  }
// --- END: ADD THIS HELPER FUNCTION ---


// --- START: UPDATED RESEARCH HUB SCRIPT ---
// ...

// --- START: UPDATED RESEARCH HUB SCRIPT (v2 - Hashtag Searches) ---
try {
    const keywordContainer = document.getElementById('keyword-container');
    const addKeywordBtn = document.getElementById('add-keyword-btn');
    const googleBtn = document.getElementById('search-google-btn');
    const tiktokBtn = document.getElementById('search-tiktok-btn');
    const instagramBtn = document.getElementById('search-instagram-btn');

    // --- Logic for Adding and Removing Input Fields (No Changes Here) ---
    function addKeywordInput() {
        const firstInputGroup = keywordContainer.querySelector('.keyword-input-group');
        const newInputGroup = firstInputGroup.cloneNode(true);
        newInputGroup.querySelector('input').value = '';
        newInputGroup.querySelector('.remove-keyword-btn').style.display = 'block';
        keywordContainer.appendChild(newInputGroup);
    }
    addKeywordBtn.addEventListener('click', addKeywordInput);
    keywordContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-keyword-btn')) {
            event.target.parentElement.remove();
        }
    });

    // --- Logic for Search Buttons (Updated Below) ---
    function getAllKeywords() {
        const inputs = keywordContainer.querySelectorAll('.product-keyword-input');
        const keywords = Array.from(inputs)
                              .map(input => input.value.trim())
                              .filter(kw => kw !== '');
        if (keywords.length === 0) {
            showToast('Please enter at least one keyword.', { type: 'warning' });
            return null;
        }
        return keywords;
    }

    // Google Trends Search (No Changes Here)
    googleBtn.addEventListener('click', () => {
        const keywords = getAllKeywords();
        if (keywords) {
            const encodedKeywords = keywords.map(kw => encodeURIComponent(kw)).join(',');
            const url = `https://trends.google.com/trends/explore?q=${encodedKeywords}`;
            window.open(url, '_blank');
        }
    });

    // --- START OF UPDATED LOGIC ---

    // TikTok Hashtag Search (Opens a new tab for each keyword)
    tiktokBtn.addEventListener('click', () => {
        const keywords = getAllKeywords();
        if (keywords) {
            // TikTok hashtag searches are done one at a time.
            // This will open a separate tab for each keyword as a hashtag.
            keywords.forEach(kw => {
                const cleanedKeyword = kw.replace(/\s+/g, ''); // Remove spaces
                const url = `https://www.tiktok.com/tag/${cleanedKeyword}`;
                window.open(url, '_blank');
            });
        }
    });

    // Instagram Hashtag Search (Opens a new tab for each keyword)
    instagramBtn.addEventListener('click', () => {
        const keywords = getAllKeywords();
        if (keywords) {
            // Instagram also searches one hashtag at a time.
            keywords.forEach(kw => {
                const cleanedKeyword = kw.replace(/\s+/g, ''); // Remove spaces
                const url = `https://www.instagram.com/explore/tags/${cleanedKeyword}/`;
                window.open(url, '_blank');
            });
        }
    });
    
    // --- END OF UPDATED LOGIC ---

} catch (e) {
    console.warn("Could not initialize the Winning Product Research Hub scripts.", e);
}


// --- END: UPDATED RESEARCH HUB SCRIPT (v2 - Hashtag Searches) ---

// admin.js -> At the very bottom, inside the main IIFE

// --- START: AI VIDEO CREATOR LOGIC ---
// admin.js -> At the very bottom of the file

// --- START: FINAL AI VIDEO CREATOR LOGIC ---
// admin.js -> At the very bottom of the file

// --- START: FINAL AI VIDEO CREATOR LOGIC (v2 - SDK Method) ---
// admin.js -> At the very bottom of the file

// --- START: CORRECTED AI VIDEO CREATOR LOGIC ---
try {
    const generateBtn = document.getElementById('generate-video-btn');
    const resultArea = document.getElementById('video-result-area');
    const durationSlider = document.getElementById('video-duration');
    const durationLabel = document.getElementById('duration-label');
    const videoProductSelect = document.getElementById('video-product-select');
    const imageSelector = document.getElementById('video-image-selector');
    const thumbnailsContainer = document.getElementById('video-image-thumbnails');
    let selectedImageUrl = '';

    videoProductSelect.addEventListener('change', () => {
        const selectedProductId = videoProductSelect.value;
        thumbnailsContainer.innerHTML = '';
        selectedImageUrl = '';
        
        if (!selectedProductId) {
            imageSelector.style.display = 'none';
            return;
        }

        const product = window.allProducts.find(p => p.product_id === selectedProductId);
        if (product && product.product_imagePath && product.product_imagePath.length > 0) {
            product.product_imagePath.forEach((url) => {
                const img = document.createElement('img');
                img.src = url;
                img.style.width = '80px';
                img.style.height = '80px';
                img.style.objectFit = 'cover';
                img.style.cursor = 'pointer';
                img.style.border = '2px solid transparent';
                img.dataset.url = url;

                img.addEventListener('click', () => {
                    thumbnailsContainer.querySelectorAll('img').forEach(i => i.style.borderColor = 'transparent');
                    img.style.borderColor = '#3498db';
                    selectedImageUrl = img.dataset.url;
                });

                thumbnailsContainer.appendChild(img);
            });
            imageSelector.style.display = 'block';
        } else {
            imageSelector.style.display = 'none';
        }
    });

    durationSlider.addEventListener('input', () => {
        durationLabel.textContent = `${durationSlider.value}s`;
    });

    generateBtn.addEventListener('click', async () => {
        if (!selectedImageUrl) {
            showToast('Select a product and an inspiration image first.', { type: 'warning' });
            return;
        }
        const provider = document.getElementById('video-provider').value;
        const duration = document.getElementById('video-duration').value;
        const platform = document.getElementById('video-platform').value;
        const prompt = document.getElementById('video-prompt').value;

        if (!prompt) {
            showToast('Please add motion instructions before generating a video.', { type: 'warning' });
            return;
        }

        resultArea.innerHTML = `<p><strong>Generating video with ${provider}...</strong><br>This can take several minutes. Please do not close this page.</p>`;
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        try {
            const res = await fetch(`${API_ROOT}/generate-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ provider, image_url: selectedImageUrl, duration, platform, prompt })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            resultArea.innerHTML = `
                <h4>Video Ready!</h4>
                <video src="${data.video_url}" controls style="width: 100%; border-radius: 8px;"></video>
                <a href="${data.video_url}" download="ai-generated-video.mpmp4">Download Video</a>
            `;

        } catch (err) {
            resultArea.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Video';
        }
    });

} catch (e) {
    console.warn("Could not initialize the AI Video Creator scripts.", e);
}
// --- END: CORRECTED AI VIDEO CREATOR LOGIC ---
// --- END: FINAL AI VIDEO CREATOR LOGIC (v2 - SDK Method) ---
// --- END: FINAL AI VIDEO CREATOR LOGIC ---




// EXPOSE THE FUNCTION TO THE GLOBAL SCOPE

window.handleAiEdit = handleAiEdit;

// Also expose your copyText function if it's not already global
window.copyText = copyText;
})(); // This is the final line of your file
