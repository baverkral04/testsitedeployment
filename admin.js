(async () => {
  // ───────────── CONFIGURATION ─────────────
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log('[ADMIN]', ...args);

  const PRODUCTS_API = `${window.API_ROOT}/products`;
  const BRAND_API = `${window.API_ROOT}/brand`;
  const UPLOAD_URL = `${window.API_ROOT}/upload-image`;

  log('Admin JS bootstrapping. API_ROOT =', window.API_ROOT);

  // ───────────── DOM ELEMENT REFERENCES ─────────────
  const customerDisplay = document.getElementById('customerDisplay');
  
  // --- Navigation Buttons ---
  const showProductsBtn = document.getElementById('showProductsBtn');
  const showBrandBtn = document.getElementById('showBrandBtn');
  const showImagesBtn = document.getElementById('showImagesBtn'); // NEW

  // --- Views ---
  const productsView = document.getElementById('productsView');
  const brandView = document.getElementById('brandView');
  const imagesView = document.getElementById('imagesView'); // NEW

  // --- Product Elements ---
  const productSelect = document.getElementById('productSelect');
  const addProductBtn = document.getElementById('addProductBtn');
  const formContainer = document.getElementById('formContainer');

  // --- Brand Elements ---
  const brandForm = document.getElementById('brandForm');
  const brandFormMsg = document.getElementById('brandFormMsg');

  if (customerDisplay) customerDisplay.textContent = window.customerId;

  // ───────────── HELPER FUNCTIONS ─────────────
  async function fetchJSON(url, opts = {}) {
    log('fetchJSON →', url, opts);
    const res = await fetch(url, opts);
    log('fetchJSON ← status', res.status, res.statusText);
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

  // =================================================================
  // ====== 1. NAVIGATION LOGIC ======
  // =================================================================

  showProductsBtn.addEventListener('click', () => {
    productsView.style.display = 'block';
    brandView.style.display = 'none';
    imagesView.style.display = 'none'; // UPDATED
    
    showProductsBtn.classList.add('active');
    showBrandBtn.classList.remove('active');
    showImagesBtn.classList.remove('active'); // UPDATED
  });

  showBrandBtn.addEventListener('click', () => {
    brandView.style.display = 'block';
    productsView.style.display = 'none';
    imagesView.style.display = 'none'; // UPDATED
    
    showBrandBtn.classList.add('active');
    showProductsBtn.classList.remove('active');
    showImagesBtn.classList.remove('active'); // UPDATED
    
    loadAndDisplayBrandInfo();
  });

  // NEW: Event listener for the Site Images button
  showImagesBtn.addEventListener('click', () => {
    imagesView.style.display = 'block';
    productsView.style.display = 'none';
    brandView.style.display = 'none';
    
    showImagesBtn.classList.add('active');
    showProductsBtn.classList.remove('active');
    showBrandBtn.classList.remove('active');
    
    // This function is in the <script> tag in admin.html
    if (typeof window.loadAndDisplayBrandImages === 'function') {
        window.loadAndDisplayBrandImages();
    }
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
  
  let cols = [], firstCol, secondCol, allProducts = [];
  
  async function getSchema() {
    log('Fetching product schema');
    return fetchJSON(PRODUCTS_API + '/schema');
  }
  
  async function initProducts() {
    log('initProducts() start');
    allProducts = await fetchJSON(PRODUCTS_API);
    log('initProducts() fetched products:', allProducts);
    if (allProducts.length > 0) {
      cols = Object.keys(allProducts[0]).filter(k => k !== 'rowid');
    } else {
      cols = await getSchema();
    }
    firstCol = "product_name";
    secondCol = "product_id";
    log('initProducts() columns derived:', cols);
    populateSelect(allProducts);
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
              alert('Upload failed: ' + e.message);
            }
          }
          fileInput.value = '';
        });
        label.appendChild(fileInput);
        label.appendChild(imageListEl);
        label.appendChild(navBar);
        label.appendChild(previewEl);
      } else {
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
        const input = formContainer.querySelector(`[name="${c}"]`);
        if (c === IMAGE_FIELD) {
            payload[c] = JSON.stringify(gatherImagePaths());
        } else if (input) {
            payload[c] = input.value;
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
      alert('Error saving: ' + e.message);
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
      alert('Error deleting: ' + e.message);
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
      alert('Error loading product: ' + e.message);
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
    await initProducts();
  } catch (e) {
    log('Initialization failed', e);
    console.error('Init error:', e);
    alert('Initialization failed: ' + e.message);
  }

})();