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
    const debouncedFetch = debounce(async (url, fn) => {
        const response = await fetch(url);
        const data = await response.json();
        fn(data);
    }, delay)

    const s = document.getElementById(elId);
    if (!s) return;

    const html = `
        <div class="ac-container" id="${elId}-ac">
            <label class="form-label" for="${elId}">${elLabel}</label>
            <input class="form-control" id="${elId}-filter" role="combobox" aria-controls="${elId}-dropdow" aria-expanded="false" aria-autocomplete="list">
            <ul class="dd-menu" id="${elId}-dropdown" role="listbox" hidden>
                <li class="dropdown-item" role="option"></li>
            </ul>
        </div>`
    s.insertAdjacentHTML('afterend', html);

    const c = document.getElementById(`${elId}-ac`);
    const f = document.getElementById(`${elId}-filter`);
    const ddm = c.querySelector('.dd-menu');
    let selectedEl = null;
    let menuItems = [];

    function selectItem(el) {
        f.value = el.textContent;
        if (selectedEl === el) return;

        s.innerHTML = '';
        const html = `
            <option value="${parseInt(el.dataset.id)}" selected></option>
        `;
        s.insertAdjacentHTML('beforeend', html);
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
        s.innerHTML = '';
        selectedEl = null;

        if (data.length === 0) {
            ddm.innerHTML = `
                    <div style="font-weight: 600;">Found nothing.</div>
                `;
            return;
        }

        const frag = document.createDocumentFragment()
        data.forEach((i, idx) => {
            const li = document.createElement('li');
            li.classList.add(['dropdown-item']);
            li.setAttribute('role', 'option');
            li.setAttribute('data-id', `${i.id}`);
            li.setAttribute('data-idx', idx);
            li.setAttribute('tabIndex', 0);
            li.setAttribute('id', 'ac-option-' + idx);
            li.setAttribute('aria-selected', 'false');
            li.textContent = i.name
            frag.appendChild(li);
        });
        ddm.append(frag)
        ddm.removeAttribute('hidden');
        f.setAttribute("aria-expanded", "true");
        menuItems = Array.from(document.querySelectorAll(
            `#${elId}-filter + .dd-menu .dropdown-item`
        ));
    }

    document.addEventListener('click', e => {
        if (e.target !== ddm) ddm.setAttribute('hidden', true);
    })

    ddm.addEventListener('click', e => {
        const el = e.target;
        if (el.classList.contains('dropdown-item')) selectItem(el);
    });

    f.addEventListener('input', e => {
        const el = e.target;
        if (el.value.length < 3) return;
        debouncedFetch(url + `?term=${el.value}`, handleApiData);
    });

    f.addEventListener('keyup', e => {
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
            c.setAttribute('aria-activedescendant', 'ac-option-0');
        }
    })

    ddm.addEventListener('keyup', e => {
        if (e.key === 'ArrowDown') {
            const idx = parseInt(
                ddm.querySelector('.dropdown-item:focus').dataset.idx
            );
            if (menuItems.length - 1 > idx) {
                menuItems[idx + 1].focus()
                c.setAttribute(
                    'aria-activedescendant', `ac-option-${idx + 1}`
                );
            } else {
                menuItems[0].focus();
                c.setAttribute(
                    'aria-activedescendant', 'ac-option-0'
                );
            }
        }
        if (e.key === 'ArrowUp') {
            const idx = parseInt(
                ddm.querySelector('.dropdown-item:focus').dataset.idx
            );
            if (idx > 0) {
                menuItems[idx - 1].focus()
                c.setAttribute(
                    'aria-activedescendant', `ac-option-${idx - 1}`
                );
            } else {
                menuItems[menuItems.length - 1].focus();
                c.setAttribute(
                    'aria-activedescendant', `ac-option-${menuItems.length - 1}`
                );
            }
        }
        if (e.key === 'Enter') selectItem(e.target)
    })
}

if (document.getElementById('ac')) {
    atAutocomplete('name', './data.json', 'Ref. system');
}
