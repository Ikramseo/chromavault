document.addEventListener('DOMContentLoaded', () => {
    const pickBtn = document.getElementById('pick-btn');
    const colorList = document.getElementById('color-list');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const toast = document.getElementById('toast');
    const sortBtn = document.getElementById('sort-btn');

    let colors = [];
    let sortOrder = 'desc'; // 'desc' (newest first) or 'asc'

    // Load colors
    loadColors();

    // Pick Color
    pickBtn.addEventListener('click', async () => {
        if (!window.EyeDropper) {
            showToast('EyeDropper API not supported in this browser.');
            return;
        }

        try {
            // Close popup is handled by chrome automatically but we need to ensure functionality
            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            const { sRGBHex } = result;

            addColor(sRGBHex);
        } catch (e) {
            console.log('User canceled selection');
        }
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        renderList(e.target.value);
    });

    // Sort
    sortBtn.addEventListener('click', () => {
        sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        renderList(searchInput.value);
    });

    // Clear
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all color history?')) {
            colors = [];
            saveColors();
            renderList();
        }
    });

    // Export
    exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(colors, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "chromavault_colors.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    function addColor(hex) {
        const newColor = {
            id: Date.now(), // timestamp as ID/index
            hex: hex,
            rgb: hexToRgb(hex),
            hsl: hexToHsl(hex),
            name: `Color ${colors.length + 1}`,
            createdAt: new Date().toISOString()
        };

        // Add to beginning
        colors.unshift(newColor);
        saveColors();
        renderList();
    }

    function saveColors() {
        chrome.storage.local.set({ colors: colors });
    }

    function loadColors() {
        chrome.storage.local.get(['colors'], (result) => {
            if (result.colors) {
                colors = result.colors;
                renderList();
            } else {
                renderList();
            }
        });
    }

    function renderList(filter = '') {
        colorList.innerHTML = '';

        let displayColors = [...colors];

        if (filter) {
            const term = filter.toLowerCase();
            displayColors = displayColors.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.hex.toLowerCase().includes(term)
            );
        }

        if (sortOrder === 'asc') {
            displayColors.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            displayColors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        if (displayColors.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            displayColors.forEach((color, index) => {
                const li = document.createElement('li');
                li.className = 'color-item';

                // Color Swatch
                const swatchContainer = document.createElement('div');
                swatchContainer.className = 'color-swatch-container';
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = color.hex;
                swatch.onclick = () => copyToClipboard(color.hex);

                const idTag = document.createElement('div');
                idTag.className = 'color-id';
                idTag.textContent = `#${displayColors.length - index}`;

                swatchContainer.appendChild(swatch);
                swatchContainer.appendChild(idTag);

                // Details
                const details = document.createElement('div');
                details.className = 'color-details';

                const nameInput = document.createElement('input');
                nameInput.className = 'color-name-input';
                nameInput.value = color.name;
                nameInput.onchange = (e) => updateName(color.id, e.target.value);

                const specs = document.createElement('div');
                specs.className = 'color-specs';

                const hexSpan = document.createElement('span');
                hexSpan.className = 'spec-val';
                hexSpan.textContent = color.hex.toUpperCase();
                hexSpan.onclick = () => copyToClipboard(color.hex);

                const rgbSpan = document.createElement('span');
                rgbSpan.className = 'spec-val';
                rgbSpan.textContent = color.rgb;
                rgbSpan.onclick = () => copyToClipboard(color.rgb);

                specs.appendChild(hexSpan);
                specs.appendChild(document.createTextNode(' • '));
                specs.appendChild(rgbSpan);

                details.appendChild(nameInput);
                details.appendChild(specs);

                // Actions
                const actions = document.createElement('div');
                actions.className = 'item-actions';

                const delBtn = document.createElement('button');
                delBtn.className = 'btn btn-small btn-delete';
                delBtn.innerHTML = '×';
                delBtn.onclick = () => deleteColor(color.id);

                actions.appendChild(delBtn);

                li.appendChild(swatchContainer);
                li.appendChild(details);
                li.appendChild(actions);

                colorList.appendChild(li);
            });
        }
    }

    function updateName(id, newName) {
        const idx = colors.findIndex(c => c.id === id);
        if (idx !== -1) {
            colors[idx].name = newName;
            saveColors();
        }
    }

    function deleteColor(id) {
        if (confirm('Delete this color?')) {
            colors = colors.filter(c => c.id !== id);
            saveColors();
            renderList(searchInput.value);
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Copied: ${text}`);
        });
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Helpers
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function hexToHsl(hex) {
        // Basic implementation
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }
});
