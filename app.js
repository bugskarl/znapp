import { populateIconGrids } from './icons.js';

document.addEventListener('DOMContentLoaded', () => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    // ServiceWorker registration successful
                })
                .catch(err => {
                    // ServiceWorker registration failed
                });
        });
    }

    // Add ripple effect to app icons
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            
            const x = e.clientX - rect.left - size/2;
            const y = e.clientY - rect.top - size/2;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    const settingsToggle = document.getElementById('settingsToggle');
    const themeToggle = document.getElementById('themeToggle');
    const addApp = document.querySelector('.add-app');
    const appControls = document.querySelectorAll('.app-controls');
    const modal = document.getElementById('addAppModal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const addAppForm = document.getElementById('addAppForm');
    const iconGrid = document.querySelector('.icon-grid');
    const selectedIcon = document.querySelector('.selected-icon');
    const selectIconBtn = document.querySelector('.select-icon-btn');
    
    const MAX_APPS_PER_ROW = 4;

    // Theme handling
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    function setTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? 'dark_mode' : 'light_mode';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else {
        setTheme(prefersDark.matches);
    }
    
    // Listen for OS theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches);
        }
    });
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        setTheme(!isDark);
    });
    
    // Modal handlers
    function closeModalHandler() {
        const modal = document.getElementById('addAppModal');
        if (modal) {
            modal.classList.remove('visible');
        }
        addAppForm.reset();
        // Reset form mode
        addAppForm.dataset.mode = 'add';
        delete addAppForm.dataset.editIndex;
        selectedIconName = 'apps';
        selectedIconType = 'material';
        
        // Reset icon selection
        selectedIconName = '';
        selectedIconType = 'material';
        
        // Reset tab state
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === 'material');
        });

        // Show material icons grid, hide brand icons
        document.getElementById('materialIcons').classList.remove('hidden');
        document.getElementById('brandIcons').classList.add('hidden');

        // Remove selected state from all icons
        document.querySelectorAll('.material-icons, .fab').forEach(icon => {
            icon.classList.remove('selected');
        });
    }

    // Add event listeners for modal closing
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
    });

    cancelBtn.addEventListener('click', closeModalHandler);

    // Icon search and selection
    const materialIcons = document.querySelector('#materialIcons');
    const brandIcons = document.querySelector('#brandIcons');
    const iconSearch = document.querySelector('#iconSearch');
    const tabButtons = document.querySelectorAll('.tab-btn');
    let selectedIconName = 'apps'; // Default icon
    let selectedIconType = 'material'; // Default type

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            if (tab === 'material') {
                materialIcons.classList.remove('hidden');
                brandIcons.classList.add('hidden');
            } else {
                materialIcons.classList.add('hidden');
                brandIcons.classList.remove('hidden');
            }
        });
    });

    // Update selected icon when modal opens
    addApp.addEventListener('click', () => {
        // Reset icon selection
        selectedIconName = '';
        selectedIconType = 'material';
        
        // Reset tab state
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === 'material');
        });

        // Show material icons grid, hide brand icons
        document.getElementById('materialIcons').classList.remove('hidden');
        document.getElementById('brandIcons').classList.add('hidden');

        // Remove selected state from all icons
        document.querySelectorAll('.material-icons, .fab').forEach(icon => {
            icon.classList.remove('selected');
        });

        // Show modal
        modal.classList.add('visible');
    });

    // Icon search functionality
    iconSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const currentGrid = materialIcons.classList.contains('hidden') ? brandIcons : materialIcons;
        const icons = currentGrid.querySelectorAll('.material-icons, .fab');
        
        icons.forEach(icon => {
            const title = icon.getAttribute('title').toLowerCase();
            const iconName = icon.textContent.toLowerCase();
            if (title.includes(searchTerm) || iconName.includes(searchTerm)) {
                icon.style.display = '';
            } else {
                icon.style.display = 'none';
            }
        });
    });

    // Icon selection
    [materialIcons, brandIcons].forEach(grid => {
        grid.addEventListener('click', (e) => {
            const icon = e.target.closest('.material-icons, .fab');
            if (icon) {
                selectedIconType = icon.classList.contains('material-icons') ? 'material' : 'brands';
                selectedIconName = selectedIconType === 'material' ? icon.textContent : icon.classList[1];
                updateSelectedIcon(selectedIconName, selectedIconType);
            }
        });
    });

    function updateSelectedIcon(iconName, iconType) {
        // Remove selected class from all icons
        materialIcons.querySelectorAll('.material-icons').forEach(icon => {
            icon.classList.remove('selected');
        });
        brandIcons.querySelectorAll('.fab').forEach(icon => {
            icon.classList.remove('selected');
        });
        
        // Add selected class to the chosen icon
        if (iconType === 'material') {
            const selectedIcon = Array.from(materialIcons.querySelectorAll('.material-icons'))
                .find(icon => icon.textContent === iconName);
            if (selectedIcon) {
                selectedIcon.classList.add('selected');
            }
        } else {
            const selectedIcon = brandIcons.querySelector(`.fab.${iconName}`);
            if (selectedIcon) {
                selectedIcon.classList.add('selected');
            }
        }
    }

    function formatTime(time) {
        if (!time) return '';
        // Ensure time is in HH:MM format
        const [hours, minutes] = time.split(':');
        const paddedHours = hours.padStart(2, '0');
        const paddedMinutes = (minutes || '00').padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}`;
    }

    // Update selected icon when editing
    function openEditModal(app, index) {
        // Opening edit modal with app
        
        // Fill form with app data
        document.getElementById('appName').value = app.name;
        document.getElementById('appUrl').value = app.url;
        selectedIconName = app.icon;
        selectedIconType = app.iconType === 'brand' ? 'brands' : (app.iconType || 'material');
        
        // Set correct tab
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === selectedIconType);
        });

        // Show correct icon grid
        document.getElementById('materialIcons').classList.toggle('hidden', selectedIconType !== 'material');
        document.getElementById('brandIcons').classList.toggle('hidden', selectedIconType !== 'brands');
        
        // Update selected icon
        updateSelectedIcon(app.icon, selectedIconType);
        
        // Set form mode to edit
        addAppForm.dataset.mode = 'edit';
        addAppForm.dataset.editIndex = index;
        
        // Show modal
        document.getElementById('addAppModal').classList.add('visible');
        
        // Handle time slots
        const timeContainer = document.querySelector('.time-slots-container');
        if (!timeContainer) {
            // Time slots container not found
            return;
        }
        timeContainer.innerHTML = '';
        
        // Time slots:
        const schedules = app.timeSlots || [];
        
        // Processed schedules:
        if (schedules.length > 0) {
            schedules.forEach((slot, index) => {
                // Creating slot:
                const timeSlotContainer = document.createElement('div');
                timeSlotContainer.className = 'time-slot';

                const timeInputsContainer = document.createElement('div');
                timeInputsContainer.className = 'time-inputs';

                const timeFromInput = document.createElement('input');
                timeFromInput.type = 'time';
                timeFromInput.className = 'time-from';
                timeFromInput.required = true;
                timeFromInput.value = slot.timeFrom;
                // Setting timeFrom:

                const timeToInput = document.createElement('input');
                timeToInput.type = 'time';
                timeToInput.className = 'time-to';
                timeToInput.required = true;
                timeToInput.value = slot.timeTo;
                // Setting timeTo:

                timeInputsContainer.appendChild(timeFromInput);
                timeInputsContainer.appendChild(timeToInput);

                const daysContainer = document.createElement('div');
                daysContainer.className = 'days-container';

                const days = [
                    { value: 'monday', label: 'Mon' },
                    { value: 'tuesday', label: 'Tue' },
                    { value: 'wednesday', label: 'Wed' },
                    { value: 'thursday', label: 'Thu' },
                    { value: 'friday', label: 'Fri' },
                    { value: 'saturday', label: 'Sat' },
                    { value: 'sunday', label: 'Sun' }
                ];

                days.forEach(day => {
                    const dayToggle = document.createElement('button');
                    dayToggle.type = 'button';
                    dayToggle.className = 'day-toggle';
                    const isSelected = Array.isArray(slot.days) && slot.days.includes(day.value);
                    dayToggle.setAttribute('data-selected', isSelected);
                    dayToggle.setAttribute('data-value', day.value);
                    dayToggle.textContent = day.label;
                    // Day toggle:

                    dayToggle.addEventListener('click', () => {
                        const currentSelected = dayToggle.getAttribute('data-selected') === 'true';
                        dayToggle.setAttribute('data-selected', !currentSelected);
                    });

                    daysContainer.appendChild(dayToggle);
                });

                // Add remove button for additional slots
                if (index > 0) {
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'remove-slot';
                    removeBtn.innerHTML = '×';
                    removeBtn.onclick = (e) => {
                        e.preventDefault();
                        timeSlotContainer.remove();
                    };
                    timeSlotContainer.appendChild(removeBtn);
                }

                timeSlotContainer.appendChild(timeInputsContainer);
                timeSlotContainer.appendChild(daysContainer);

                timeContainer.appendChild(timeSlotContainer);
            });
        } else {
            // Create a default empty time slot
            const timeSlotContainer = document.createElement('div');
            timeSlotContainer.className = 'time-slot';

            const timeFromInput = document.createElement('input');
            timeFromInput.type = 'time';
            timeFromInput.value = '';
            timeFromInput.className = 'time-from';
            timeFromInput.required = true;

            const timeToInput = document.createElement('input');
            timeToInput.type = 'time';
            timeToInput.value = '';
            timeToInput.className = 'time-to';
            timeToInput.required = true;

            const daysContainer = document.createElement('div');
            daysContainer.className = 'days-container';

            const days = [
                { value: 'monday', label: 'Mon' },
                { value: 'tuesday', label: 'Tue' },
                { value: 'wednesday', label: 'Wed' },
                { value: 'thursday', label: 'Thu' },
                { value: 'friday', label: 'Fri' },
                { value: 'saturday', label: 'Sat' },
                { value: 'sunday', label: 'Sun' }
            ];
            days.forEach(day => {
                const dayToggle = document.createElement('button');
                dayToggle.type = 'button';
                dayToggle.className = 'day-toggle';
                dayToggle.setAttribute('data-selected', 'false');
                dayToggle.setAttribute('data-value', day.value);
                dayToggle.textContent = day.label;

                dayToggle.addEventListener('click', () => {
                    const currentSelected = dayToggle.getAttribute('data-selected') === 'true';
                    dayToggle.setAttribute('data-selected', !currentSelected);
                });

                daysContainer.appendChild(dayToggle);
            });

            const timeInputsContainer = document.createElement('div');
            timeInputsContainer.className = 'time-inputs';

            timeInputsContainer.appendChild(timeFromInput);
            timeInputsContainer.appendChild(timeToInput);

            timeSlotContainer.appendChild(timeInputsContainer);
            timeSlotContainer.appendChild(daysContainer);
            timeContainer.appendChild(timeSlotContainer);
        }
    }

    function getTimeSlots() {
        const timeSlots = [];
        const timeSlotContainers = document.querySelectorAll('.time-slot');
        // Getting time slots from containers

        timeSlotContainers.forEach((container, index) => {
            const timeFrom = container.querySelector('.time-from').value;
            const timeTo = container.querySelector('.time-to').value;
            const days = Array.from(container.querySelectorAll('.day-toggle'))
                .filter(toggle => toggle.getAttribute('data-selected') === 'true')
                .map(toggle => toggle.getAttribute('data-value'));

            // Final time slots:
            if (timeFrom && timeTo && days.length > 0) {
                timeSlots.push({ timeFrom, timeTo, days });
            }
        });

        // Returning processed time slots
        return timeSlots;
    }

    // Add app handlers
    const addAppButton = document.querySelector('.add-app');
    const cancelButton = document.querySelector('.cancel-btn');

    addAppButton.addEventListener('click', () => {
        addAppForm.dataset.mode = 'add';
        delete addAppForm.dataset.editIndex;
        addAppForm.reset();

        // Initialize the days for the first time slot
        const daysContainer = addAppForm.querySelector('.days-container');
        daysContainer.innerHTML = ''; // Clear any existing days
        const days = [
            { value: 'monday', label: 'Mon' },
            { value: 'tuesday', label: 'Tue' },
            { value: 'wednesday', label: 'Wed' },
            { value: 'thursday', label: 'Thu' },
            { value: 'friday', label: 'Fri' },
            { value: 'saturday', label: 'Sat' },
            { value: 'sunday', label: 'Sun' }
        ];
        days.forEach(day => {
            const dayToggle = document.createElement('button');
            dayToggle.type = 'button';
            dayToggle.className = 'day-toggle';
            dayToggle.setAttribute('data-selected', 'true');  // All days selected by default
            dayToggle.setAttribute('data-value', day.value);
            dayToggle.textContent = day.label;

            dayToggle.addEventListener('click', () => {
                const isSelected = dayToggle.getAttribute('data-selected') === 'true';
                dayToggle.setAttribute('data-selected', !isSelected);
            });

            daysContainer.appendChild(dayToggle);
        });

        modal.classList.add('visible');
    });

    cancelButton.addEventListener('click', () => {
        modal.classList.remove('visible');
        addAppForm.reset();
        // Reset form mode
        addAppForm.dataset.mode = 'add';
        delete addAppForm.dataset.editIndex;
    });

    const addTimeSlotBtn = document.getElementById('addTimeSlot');
    const timeSlotContainer = document.querySelector('.time-slots-container');

    addTimeSlotBtn.addEventListener('click', () => {
        const timeSlots = timeSlotContainer.querySelectorAll('.time-slot');
        if (timeSlots.length >= 5) {
            // Maximum of 5 time slots allowed
            return;
        }

        const newTimeSlot = document.createElement('div');
        newTimeSlot.className = 'time-slot';
        
        // Add remove button for additional slots
        if (timeSlots.length > 0) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-slot';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = (e) => {
                e.preventDefault();
                newTimeSlot.remove();
            };
            newTimeSlot.appendChild(removeBtn);
        }

        const timeFromInput = document.createElement('input');
        timeFromInput.type = 'time';
        timeFromInput.className = 'time-from';
        timeFromInput.required = true;

        const timeToInput = document.createElement('input');
        timeToInput.type = 'time';
        timeToInput.className = 'time-to';
        timeToInput.required = true;

        const daysContainer = document.createElement('div');
        daysContainer.className = 'days-container';

        const days = [
            { value: 'monday', label: 'Mon' },
            { value: 'tuesday', label: 'Tue' },
            { value: 'wednesday', label: 'Wed' },
            { value: 'thursday', label: 'Thu' },
            { value: 'friday', label: 'Fri' },
            { value: 'saturday', label: 'Sat' },
            { value: 'sunday', label: 'Sun' }
        ];
        days.forEach(day => {
            const dayToggle = document.createElement('button');
            dayToggle.type = 'button';
            dayToggle.className = 'day-toggle';
            dayToggle.setAttribute('data-selected', 'true');  // All days selected by default
            dayToggle.setAttribute('data-value', day.value);
            dayToggle.textContent = day.label;

            dayToggle.addEventListener('click', () => {
                const isSelected = dayToggle.getAttribute('data-selected') === 'true';
                dayToggle.setAttribute('data-selected', !isSelected);
            });

            daysContainer.appendChild(dayToggle);
        });

        const timeInputsContainer = document.createElement('div');
        timeInputsContainer.className = 'time-inputs';

        timeInputsContainer.appendChild(timeFromInput);
        timeInputsContainer.appendChild(timeToInput);

        newTimeSlot.appendChild(timeInputsContainer);
        newTimeSlot.appendChild(daysContainer);

        timeSlotContainer.appendChild(newTimeSlot);
    });

    function createAppElement(app, index, inTime) {
        const appElement = document.createElement('div');
        appElement.className = 'app-icon';
        appElement.setAttribute('data-index', index);
        appElement.draggable = true;

        if (!inTime) {
            appElement.classList.add('out-of-time');
        }

        const isSettingsEnabled = settingsToggle.classList.contains('active');

        // Add controls container
        const controls = document.createElement('div');
        controls.className = 'app-controls';
        if (isSettingsEnabled) {
            controls.classList.add('visible');
        }
        appElement.appendChild(controls);

        // Add edit button
        const editBtn = document.createElement('span');
        editBtn.className = 'material-icons control-icon edit-icon';
        editBtn.textContent = 'edit';
        editBtn.addEventListener('click', () => openEditModal(app, index));
        controls.appendChild(editBtn);

        // Add remove button
        const removeBtn = document.createElement('span');
        removeBtn.className = 'material-icons control-icon remove-icon';
        removeBtn.textContent = 'delete';
        removeBtn.addEventListener('click', () => {
            if (confirm(`Do you really want to delete "${app.name}"?`)) {
                const apps = JSON.parse(localStorage.getItem('apps') || '[]');
                apps.splice(index, 1);
                localStorage.setItem('apps', JSON.stringify(apps));
                reloadAppGrid(apps);
            }
        });
        controls.appendChild(removeBtn);

        if (isSettingsEnabled) {
            appElement.classList.add('draggable');
        } else {
            // When settings disabled, make it clickable to open URL
            appElement.style.cursor = 'pointer';
            appElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (app.url) {
                    window.open(app.url, '_blank');
                }
            });
        }

        // Set icon class based on type
        const iconClass = app.iconType === 'material' ? 
            'material-icons' : 
            `fab ${app.icon}`;
        
        const icon = document.createElement('span');
        icon.className = iconClass;
        icon.textContent = app.iconType === 'material' ? app.icon : '';
        appElement.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'app-name';
        name.textContent = app.name;
        appElement.appendChild(name);

        // Add drag event listeners
        appElement.addEventListener('dragstart', handleDragStart);
        appElement.addEventListener('dragend', handleDragEnd);
        appElement.addEventListener('dragover', handleDragOver);
        appElement.addEventListener('drop', handleDrop);

        return appElement;
    }

    let draggedApp = null;

    function handleDragStart(e) {
        const isSettingsEnabled = settingsToggle.classList.contains('active');
        if (!isSettingsEnabled) {
            e.preventDefault();
            return;
        }
        draggedApp = e.target.closest('.app-icon');
        if (!draggedApp || draggedApp.classList.contains('add-app')) {
            e.preventDefault();
            return;
        }
        draggedApp.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggedApp.getAttribute('data-index'));
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        if (draggedApp) {
            draggedApp.classList.remove('dragging');
            document.querySelectorAll('.app-icon').forEach(app => {
                app.classList.remove('drag-over');
            });
            draggedApp = null;
        }
    }

    function handleDragOver(e) {
        if (!settingsToggle.classList.contains('active')) return;
        
        const target = e.target.closest('.app-icon');
        if (!target || target === draggedApp || target.classList.contains('add-app')) {
            return;
        }
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Add drag-over class to target
        document.querySelectorAll('.app-icon').forEach(app => {
            app.classList.remove('drag-over');
        });
        target.classList.add('drag-over');
    }

    function handleDrop(e) {
        if (!settingsToggle.classList.contains('active')) return;
        e.preventDefault();
        
        const dropTarget = e.target.closest('.app-icon');
        if (!dropTarget || dropTarget === draggedApp || dropTarget.classList.contains('add-app')) {
            return;
        }

        // Get indices
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = parseInt(dropTarget.getAttribute('data-index'));
        
        if (fromIndex === toIndex) return;

        // Get the current apps and reorder
        const apps = JSON.parse(localStorage.getItem('apps') || '[]');
        const [movedApp] = apps.splice(fromIndex, 1);
        apps.splice(toIndex, 0, movedApp);
        
        // Save and reload
        localStorage.setItem('apps', JSON.stringify(apps));
        reloadAppGrid(apps);
    }

    function reloadAppGrid(apps) {
        // Get fresh references to elements
        const appGrid = document.querySelector('.app-grid');
        const addApp = document.querySelector('.add-app');
        
        // Clear the grid
        appGrid.innerHTML = '';
        
        // Add the "Add App" button first
        appGrid.appendChild(addApp);

        const isSettingsEnabled = settingsToggle.classList.contains('active');

        // When settings enabled, show ALL apps. When disabled, only show in-time apps
        const appsToShow = isSettingsEnabled ? apps : apps.filter(app => isAppInTime(app));

        // Hide grid if no apps to show and settings is disabled
        appGrid.style.display = (!isSettingsEnabled && appsToShow.length === 0) ? 'none' : 'flex';

        // Add all apps to the grid in reverse order
        [...appsToShow].reverse().forEach(app => {
            // Adding app
            const appElement = createAppElement(
                app,
                apps.indexOf(app),
                isSettingsEnabled ? isAppInTime(app) : true
            );
            appGrid.insertBefore(appElement, addApp);
        });
    }

    function isAppInTime(app) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const currentDay = now.getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDayName = days[currentDay];

        // If the app has timeSlots, check each slot
        if (app.timeSlots && app.timeSlots.length > 0) {
            return app.timeSlots.some(slot => {
                const [fromHours, fromMinutes] = slot.timeFrom.split(':').map(Number);
                const [toHours, toMinutes] = slot.timeTo.split(':').map(Number);
                const timeFrom = fromHours * 60 + fromMinutes;
                const timeTo = toHours * 60 + toMinutes;
                
                return slot.days.includes(currentDayName) && currentTime >= timeFrom && currentTime <= timeTo;
            });
        }

        // Legacy support for old format
        if (app.timeFrom && app.timeTo && app.days) {
            const [fromHours, fromMinutes] = app.timeFrom.split(':').map(Number);
            const [toHours, toMinutes] = app.timeTo.split(':').map(Number);
            const timeFrom = fromHours * 60 + fromMinutes;
            const timeTo = toHours * 60 + toMinutes;
            
            return app.days.includes(currentDayName) && currentTime >= timeFrom && currentTime <= timeTo;
        }

        return true;
    }

    // Form submission handler
    addAppForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Form submitted

        const name = document.getElementById('appName').value;
        const url = document.getElementById('appUrl').value;

        // Validate required fields
        if (!name || !url || !selectedIconName) {
            // Please fill in all required fields and select an icon
            return;
        }

        const timeSlots = getTimeSlots();
        // Got time slots

        // Validate time slots
        if (!timeSlots || timeSlots.length === 0) {
            // Please add at least one valid time slot with selected days
            return;
        }

        const newApp = {
            name,
            url,
            icon: selectedIconName,
            iconType: selectedIconType === 'brands' ? 'brand' : selectedIconType,
            timeSlots: timeSlots
        };

        // Saving app
        const apps = JSON.parse(localStorage.getItem('apps') || '[]');

        if (addAppForm.dataset.mode === 'edit') {
            const index = parseInt(addAppForm.dataset.editIndex);
            // Editing app
            apps[index] = newApp;
        } else {
            // Adding new app
            apps.push(newApp);
        }

        // Saving updated apps
        localStorage.setItem('apps', JSON.stringify(apps));
        // Apps saved
        reloadAppGrid(apps);
        closeModalHandler();
    });

    const infoToggle = document.getElementById('infoToggle');
    const infoPanel = document.getElementById('infoPanel');

    // Current version of the info panel content - increase this when you update the content
    const CURRENT_INFO_VERSION = "1.0";

    // Check if user has previously seen this version of the info panel
    const storedVersion = localStorage.getItem('infoPanelVersion');
    
    // Show panel if:
    // 1. No version stored (first time user)
    // 2. Stored version is older than current version
    if (infoPanel && (!storedVersion || storedVersion < CURRENT_INFO_VERSION)) {
        infoPanel.classList.remove('hidden');
        infoToggle.classList.add('active');
    }

    // Info toggle click handler
    if (infoToggle && infoPanel) {
        infoToggle.addEventListener('click', () => {
            const isHidden = infoPanel.classList.toggle('hidden');
            infoToggle.classList.toggle('active');
            
            // Update version when panel is hidden
            if (isHidden) {
                localStorage.setItem('infoPanelVersion', CURRENT_INFO_VERSION);
            }
        });
    }

    // Initialize settings toggle state
    if (settingsToggle) {
        const settingsState = localStorage.getItem('settingsActive');
        if (settingsState === null) {
            // First time user - settings active by default
            settingsToggle.classList.add('active');
            addApp.classList.add('visible');
            document.querySelectorAll('.app-controls').forEach(controls => {
                controls.classList.add('visible');
            });
            document.querySelectorAll('.app-icon:not(.add-app)').forEach(app => {
                app.classList.add('draggable');
            });
            localStorage.setItem('settingsActive', 'true');
        } else if (settingsState === 'true') {
            // User had settings active
            settingsToggle.classList.add('active');
            addApp.classList.add('visible');
            document.querySelectorAll('.app-controls').forEach(controls => {
                controls.classList.add('visible');
            });
            document.querySelectorAll('.app-icon:not(.add-app)').forEach(app => {
                app.classList.add('draggable');
            });
        }

        // Settings toggle click handler
        settingsToggle.addEventListener('click', () => {
            const isActive = settingsToggle.classList.toggle('active');
            addApp.classList.toggle('visible');
            
            // Toggle controls visibility
            document.querySelectorAll('.app-controls').forEach(controls => {
                controls.classList.toggle('visible');
            });
            
            // Toggle draggable state on all apps
            document.querySelectorAll('.app-icon:not(.add-app)').forEach(app => {
                app.classList.toggle('draggable');
            });

            // Always hide settings toggle view after first hiding
            localStorage.setItem('settingsActive', false);

            // Reload grid to show/hide apps based on new settings state
            const apps = JSON.parse(localStorage.getItem('apps') || '[]');
            reloadAppGrid(apps);
        });
    }

    // Set up periodic refresh to update visibility based on time
    setInterval(() => {
        if (settingsToggle && !settingsToggle.classList.contains('active')) {
            const apps = JSON.parse(localStorage.getItem('apps') || '[]');
            reloadAppGrid(apps);
        }
    }, 60000); // Check every minute

    // Install prompt handling
    let deferredPrompt;
    const installPrompt = document.getElementById('installPrompt');
    const installButton = document.getElementById('installButton');

    // Function to update prompt content
    function showInstalledMessage() {
        const content = installPrompt.querySelector('.install-prompt-content');
        content.innerHTML = `
            <h2>Znapp Installed</h2>
            <p>Please use the installed app version for the best experience.</p>
        `;
    }

    // Check if the app is running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        installPrompt.style.display = 'none';
    } else {
        // Show install prompt immediately for browser users
        installPrompt.classList.add('show');

        // Handle install prompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
        });

        // Handle the install button click
        installButton.addEventListener('click', () => {
            // Change panel content immediately
            showInstalledMessage();
            
            // Then handle the install prompt if available
            if (deferredPrompt) {
                deferredPrompt.prompt().then(async () => {
                    try {
                        const { outcome } = await deferredPrompt.userChoice;
                        deferredPrompt = null;
                        
                        // If user cancels, revert the panel
                        if (outcome !== 'accepted') {
                            const content = installPrompt.querySelector('.install-prompt-content');
                            content.innerHTML = `
                                <h2>Install Znapp</h2>
                                <p>Add this app to your home screen for the best experience!</p>
                                <button class="install-button" id="installButton">Install Now</button>
                            `;
                            // Reattach click handler to new button
                            document.getElementById('installButton').addEventListener('click', arguments.callee);
                        }
                    } catch (error) {
                        // Installation error
                    }
                });
            }
        });
    }

    // Initial setup
    function initializeApp() {
        // Load icons dynamically
        populateIconGrids();
        
        // Load apps from storage
        const apps = JSON.parse(localStorage.getItem('apps') || '[]');
        reloadAppGrid(apps);
    }

    // Run initialization
    setTimeout(initializeApp, 0);
});
