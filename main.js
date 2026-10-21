
/**
 * @param {string} elId ID of hidden input element which will be submitted with selected value
 * @param {string} url API url
 * @param {integer} delay Debouce delay
 */
function atAutocomplete(elId, url, elLabel = 'Search:', delay = 300) {
    function debounce(fn, delay = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * fn - function intended for processing received data
     * In this case it's called "handleApiData"
     */
    const fetchData = debounce(async (url, fn) => {
        const response = await fetch(url);
        const data = await response.json();
        fn(data);
    }, delay)

    const cb = document.getElementById(elId);
    const html = `
        <div class="ac-container" id="${elId}-ac">
            <input class="form-control" id="${elId}-filter" role="combobox" aria-controls="${elId}-dropdow" aria-expanded="false" aria-autocomplete="list">
            <ul class="dd-menu" id="${elId}-dropdown" role="listbox" hidden>
                <li class="dropdown-item" role="option"></li>
            </ul>
        </div>`
    cb.insertAdjacentHTML('afterend', html);

    const f = document.getElementById(`${elId}-filter`);
    const ddm = document.getElementById(`${elId}-dropdown`);
    let selectedEl = null;
    let menuItems = [];

    function selectItem(el) {
        f.value = el.textContent;
        if (selectedEl === el) return;

        cb.innerHTML = '';
        const html = `<option value="${parseInt(el.dataset.id)}" selected></option>`;
        cb.insertAdjacentHTML('beforeend', html);
        el.classList.add('selected');
        if (selectedEl) {
            selectedEl.setAttribute('aria-selected', 'false');
            selectedEl.classList.remove('selected');
        }
        selectedEl = el;
        selectedEl.setAttribute('aria-selected', 'true');
        ddm.setAttribute('hidden', true);
        f.setAttribute('aria-expanded', 'false');
        f.focus();
    }

    /**
     * Creates dropdown based on data receved from API
     */
    function handleApiData(data) {
        ddm.innerHTML = '';
        cb.innerHTML = '';
        selectedEl = null;

        if (data.length === 0) {
            ddm.innerHTML = `<div class="dropdown-item found-nothing-item">Found nothing.</div>`;
            ddm.removeAttribute('hidden');
            return;
        }

        const frag = document.createDocumentFragment();
        data.forEach((i, idx) => {
            const li = document.createElement('li');
            li.classList.add(['dropdown-item']);
            li.setAttribute('role', 'option');
            li.setAttribute('data-id', `${i.id}`);
            li.setAttribute('data-idx', idx);
            li.setAttribute('tabIndex', 0);
            li.setAttribute('id', 'ac-option-' + idx);
            li.setAttribute('aria-selected', 'false');
            li.textContent = i.label;
            frag.appendChild(li);
        });
        ddm.append(frag);
        ddm.removeAttribute('hidden');
        f.setAttribute("aria-expanded", "true");
        menuItems = Array.from(document.querySelectorAll(
            `#${elId}-filter + .dd-menu .dropdown-item`
        ));
    }

    document.querySelector('html').addEventListener('click', e => {
        if (e.target !== ddm) ddm.setAttribute('hidden', true);
    })

    ddm.addEventListener('click', e => {
        const el = e.target;
        if (el.classList.contains('dropdown-item')) selectItem(el);
    });

    f.addEventListener('keyup', function (e) {
        if (e.key === 'ArrowDown' && menuItems.length) {
            ddm.removeAttribute('hidden');
            if (selectedEl) {
                const idx = parseInt(selectedEl.dataset.idx);
                if (menuItems.length - 1 > idx) {
                    menuItems[idx + 1].focus();
                } else {
                    menuItems[0].focus();
                }
            } else {
                menuItems[0].focus();
            }
            f.setAttribute('aria-activedescendant', 'ac-option-0');
        } else {
            if (this.value.length < 3) return;
            fetchData(url + `?term=${this.value}`, handleApiData);
        }
    })

    ddm.addEventListener('keyup', e => {
        if (e.key === 'ArrowDown') {
            const idx = parseInt(ddm.querySelector('.dropdown-item:focus').dataset.idx);
            if (menuItems.length - 1 > idx) {
                menuItems[idx + 1].focus();
                f.setAttribute('aria-activedescendant', `ac-option-${idx + 1}`);
            } else {
                menuItems[0].focus();
                f.setAttribute('aria-activedescendant', 'ac-option-0');
            }
        }
        if (e.key === 'ArrowUp') {
            const idx = parseInt(ddm.querySelector('.dropdown-item:focus').dataset.idx);
            if (idx > 0) {
                menuItems[idx - 1].focus();
                f.setAttribute('aria-activedescendant', `ac-option-${idx - 1}`);
            } else {
                menuItems[menuItems.length - 1].focus();
                f.setAttribute('aria-activedescendant', `ac-option-${menuItems.length - 1}`);
            }
        }
        if (e.key === 'Enter') selectItem(e.target);
    })
}
