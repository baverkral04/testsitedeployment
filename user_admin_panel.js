(async () => {
    //
    // THIS SCRIPT ASSUMES a global `customerId` is defined, e.g., in user.js
    //
    // ✅ FIX: Point to the correct PRODUCTS API endpoint
    const PRODUCTS_API = `${API_ROOT}/products`;
    const UPLOAD_URL = `${API_ROOT}/upload-image`;

    // --- DOM Elements ---
    const productSelect = document.getElementById('productSelect');
    const addProductBtn = document.getElementById('addProductBtn');
    const formContainer = document.getElementById('formContainer');
    
    // --- State ---
    let allProducts = [];
    let schemaColumns = [];

    // --- API Helpers ---
    async function fetchJSON(url, options = {}) {
        const res = await fetch(url, options);
        let data = null;
        try { data = await res.json(); } catch {}
        if (!res.ok) {
            const errorMsg = data?.error || `Request failed with status ${res.status}`;
            throw new Error(errorMsg);
        }
        return data;
    }

    // --- Core Functions ---
    async function initialize() {
        try {
            allProducts = await fetchJSON(PRODUCTS_API);
            if (allProducts.length > 0) {
                // Infer columns from the first product, excluding 'rowid'
                schemaColumns = Object.keys(allProducts[0]).filter(key => key !== 'rowid');
            } else {
                // Fallback to schema endpoint if no products exist
                schemaColumns = await fetchJSON(`${PRODUCTS_API}/schema`);
            }
            populateSelect();
        } catch (e) {
            alert(`Error initializing: ${e.message}`);
        }
    }

    function populateSelect() {
        productSelect.innerHTML = '<option value="">-- Select a Product --</option>';
        allProducts.forEach(product => {
            const option = document.createElement('option');
            // ✅ FIX: Use product_id for the value
            option.value = product.product_id; 
            option.textContent = `${product.product_name} (${product.product_id})`;
            productSelect.appendChild(option);
        });
    }

    function renderForm(productData = {}) {
        formContainer.innerHTML = ''; // Clear previous form
        schemaColumns.forEach(col => {
            const label = document.createElement('label');
            label.textContent = col;
            
            const input = document.createElement('input');
            input.name = col;
            input.value = productData[col] || '';

            // ✅ FIX: Make product_id read-only to prevent editing the primary key
            if (col === 'product_id') {
                input.readOnly = true;
                if (!input.value) {
                    // Suggest a new ID for new products, which the backend will generate
                    input.placeholder = '(auto-generated on save)';
                }
            }
            
            label.appendChild(input);
            formContainer.appendChild(label);
        });

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.onclick = saveProduct;
        formContainer.appendChild(saveBtn);

        // ✅ FIX: Show delete button only for existing products
        if (productData.product_id) {
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = deleteProduct;
            formContainer.appendChild(deleteBtn);
        }
    }

    async function saveProduct() {
        const currentProductId = productSelect.value;
        const formInputs = formContainer.querySelectorAll('input');
        const payload = {};
        formInputs.forEach(input => {
            // Don't send an empty, client-generated product_id
            if (input.name === 'product_id' && !currentProductId) return;
            payload[input.name] = input.value;
        });

        try {
            let updatedProduct;
            if (currentProductId) {
                // Update existing product
                await fetchJSON(`${PRODUCTS_API}/${currentProductId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                updatedProduct = { ...payload, product_id: currentProductId };
            } else {
                // Create new product
                // ✅ FIX: Expect 'product_id' in the response, not 'rowid'
                const newProduct = await fetchJSON(PRODUCTS_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                updatedProduct = { ...payload, product_id: newProduct.product_id };
            }

            // Refresh everything
            await initialize();
            productSelect.value = updatedProduct.product_id;
            renderForm(updatedProduct);
            alert('Product saved successfully!');
        } catch (e) {
            alert(`Error saving product: ${e.message}`);
        }
    }

    async function deleteProduct() {
        const productId = productSelect.value;
        if (!productId || !confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            // ✅ FIX: Use product_id in the URL
            await fetchJSON(`${PRODUCTS_API}/${productId}`, { method: 'DELETE' });
            
            // Refresh and clear form
            await initialize();
            renderForm();
            alert('Product deleted successfully!');
        } catch (e) {
            alert(`Error deleting product: ${e.message}`);
        }
    }
    
    // --- Event Listeners ---
    productSelect.addEventListener('change', () => {
        const selectedId = productSelect.value;
        if (selectedId) {
            // Find product from our cached list instead of another API call
            const product = allProducts.find(p => p.product_id === selectedId);
            renderForm(product);
        } else {
            renderForm(); // Clear form if "Select" is chosen
        }
    });

    addProductBtn.addEventListener('click', () => {
        productSelect.value = '';
        renderForm(); // Render an empty form for a new product
    });

    // --- Initial Load ---
    initialize();
})();