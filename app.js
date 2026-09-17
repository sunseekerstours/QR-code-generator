/**
 * SUNSEEKERS QR CODE GENERATOR
 * Core Studio Controller, Batch Engine & Library Manager
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // CONSTANTS & STARTER DATA
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'sunseekers_qr_library_v1';
  const CATEGORIES_STORAGE_KEY = 'sunseekers_categories_v1';
  const TYPES_STORAGE_KEY = 'sunseekers_datatypes_v1';
  const SUPABASE_STORAGE_KEY = 'sunseekers_supabase_v1';

  const DEFAULT_SUPABASE_CONFIG = {
    url: 'https://quaggsbpiewmxcxceoyg.supabase.co',
    key: 'sb_publishable_4SXazBJJ4GlEWrDsq7yt4A_XT67YuoW'
  };

  const DEFAULT_CATEGORIES = [
    'Fleet & Buses',
    'Tickets & Booking',
    'Passenger Wi-Fi',
    'Customer Feedback',
    'VIP Lounges',
    'Social & Marketing',
    'Operations'
  ];

  const DEFAULT_DATA_TYPES = [
    {
      id: 'url',
      name: 'Website / Link (URL)',
      prefix: '',
      placeholder: 'https://sunseekers.co.za/book',
      hint: 'Validates destination website address automatically',
      isBuiltin: true
    },
    {
      id: 'wifi',
      name: 'Bus Wi-Fi Connect',
      prefix: 'WIFI:',
      placeholder: '',
      hint: 'Direct one-tap passenger onboard Wi-Fi connection',
      isBuiltin: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Booking Line',
      prefix: 'https://wa.me/',
      placeholder: '+27821234567',
      hint: 'Direct WhatsApp chat with customer dispatch',
      isBuiltin: true
    },
    {
      id: 'vcard',
      name: 'Business Contact (vCard)',
      prefix: 'BEGIN:VCARD',
      placeholder: '',
      hint: 'Instant contact save to passenger phone address book',
      isBuiltin: true
    },
    {
      id: 'text',
      name: 'Plain Text / Note',
      prefix: '',
      placeholder: 'Custom text or code',
      hint: 'Displays plain text or reference code when scanned',
      isBuiltin: true
    },
    {
      id: 'phone',
      name: 'Direct Phone Call',
      prefix: 'tel:',
      placeholder: '+27 11 555 0199',
      hint: 'Prompts phone dialer to call dispatch desk directly',
      isBuiltin: false
    },
    {
      id: 'email',
      name: 'Email Dispatch',
      prefix: 'mailto:',
      placeholder: 'info@sunseekers.co.za',
      hint: 'Opens email client with pre-addressed email',
      isBuiltin: false
    },
    {
      id: 'sms',
      name: 'SMS Text Message',
      prefix: 'SMSTO:',
      placeholder: '+27821234567',
      hint: 'Opens SMS messenger with pre-filled number',
      isBuiltin: false
    },
    {
      id: 'maps',
      name: 'Google Maps Location',
      prefix: 'https://maps.google.com/?q=',
      placeholder: 'Sunseekers Terminal, Cape Town',
      hint: 'Opens Google Maps navigation directly to terminal',
      isBuiltin: false
    },
    {
      id: 'instagram',
      name: 'Instagram Profile',
      prefix: 'https://instagram.com/',
      placeholder: 'sunseekerstravel',
      hint: 'Direct link to company social profile',
      isBuiltin: false
    }
  ];

  const DEFAULT_FLEET_BATCH = [
    {
      name: 'Fleet Bus #101 - Direct Booking',
      url: 'https://sunseekers.co.za/fleet/bus-101/book',
      category: 'Fleet & Buses'
    },
    {
      name: 'Fleet Bus #102 - Cape Town Express',
      url: 'https://sunseekers.co.za/routes/cape-town-express',
      category: 'Fleet & Buses'
    },
    {
      name: 'Passenger High-Speed Wi-Fi',
      url: 'WIFI:T:WPA;S:Sunseekers-Passenger-WiFi;P:SeekTheSun2026;;',
      category: 'Passenger Wi-Fi'
    },
    {
      name: 'Passenger Journey Feedback',
      url: 'https://sunseekers.co.za/feedback?source=coach_qr',
      category: 'Customer Feedback'
    }
  ];

  const THEME_PRESETS = {
    sunset: {
      mode: 'linear',
      angle: 45,
      primary: '#F57C00',
      secondary: '#D84315',
      bg: '#FFFFFF',
      customEyes: true,
      eyeFrame: '#BF360C',
      eyeDot: '#F57C00',
      frameBg: '#F57C00',
      frameText: '#FFFFFF'
    },
    ocean: {
      mode: 'linear',
      angle: 135,
      primary: '#0284C7',
      secondary: '#0369A1',
      bg: '#FFFFFF',
      customEyes: true,
      eyeFrame: '#0C4A6E',
      eyeDot: '#0284C7',
      frameBg: '#0284C7',
      frameText: '#FFFFFF'
    },
    onyx: {
      mode: 'linear',
      angle: 45,
      primary: '#0F172A',
      secondary: '#334155',
      bg: '#FFFFFF',
      customEyes: true,
      eyeFrame: '#020617',
      eyeDot: '#D97706',
      frameBg: '#0F172A',
      frameText: '#F8FAFC'
    },
    safari: {
      mode: 'linear',
      angle: 90,
      primary: '#D97706',
      secondary: '#78350F',
      bg: '#FFFFFF',
      customEyes: true,
      eyeFrame: '#451A03',
      eyeDot: '#D97706',
      frameBg: '#B45309',
      frameText: '#FFFFFF'
    },
    emerald: {
      mode: 'linear',
      angle: 45,
      primary: '#059669',
      secondary: '#064E3B',
      bg: '#FFFFFF',
      customEyes: true,
      eyeFrame: '#064E3B',
      eyeDot: '#10B981',
      frameBg: '#059669',
      frameText: '#FFFFFF'
    },
    custom: {
      mode: 'linear',
      angle: 45,
      primary: '#EC4899',
      secondary: '#8B5CF6',
      bg: '#FFFFFF',
      customEyes: false,
      eyeFrame: '#8B5CF6',
      eyeDot: '#EC4899',
      frameBg: '#8B5CF6',
      frameText: '#FFFFFF'
    }
  };

  // --------------------------------------------------------------------------
  // APPLICATION STATE
  // --------------------------------------------------------------------------
  const state = {
    // Current Studio QR Configuration
    config: {
      name: 'Sunseekers Express Booking',
      category: 'Fleet & Buses',
      type: 'url',
      subtitle: 'Point camera to view timetable & book seats',
      rawUrl: 'https://sunseekers.co.za/book-tickets',
      computedData: 'https://sunseekers.co.za/book-tickets',
      
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',

      colorMode: 'linear',
      gradientAngle: 45,
      primaryColor: '#F57C00',
      secondaryColor: '#D84315',
      bgColor: '#FFFFFF',
      transparentBg: false,

      customEyeColors: true,
      eyeFrameColor: '#BF360C',
      eyeDotColor: '#F57C00',

      logoSrc: 'assets/sunseekers-logo.svg',
      logoSize: 0.30,
      logoMargin: 3,
      hideBackgroundDots: true,

      frameStyle: 'bottom-banner',
      frameText: 'SCAN TO BOOK',
      frameBgColor: '#F57C00',
      frameTextColor: '#FFFFFF',

      exportSize: 1200
    },

    // Batch items queue
    batchItems: JSON.parse(JSON.stringify(DEFAULT_FLEET_BATCH)),
    batchGeneratedQrs: [],

    // Categories and Data Types Lists
    categories: [],
    dataTypes: [],

    // Supabase Cloud Sync Configuration
    supabase: {
      url: 'https://quaggsbpiewmxcxceoyg.supabase.co',
      key: 'sb_publishable_4SXazBJJ4GlEWrDsq7yt4A_XT67YuoW',
      connected: false,
      tablesReady: false
    },

    // Library items
    library: []
  };

  let qrCodeInstance = null;
  let updateDebounceTimeout = null;

  // --------------------------------------------------------------------------
  // DOM REFERENCES
  // --------------------------------------------------------------------------
  const elements = {
    // Navigation Tabs
    tabBtnStudio: document.getElementById('tabBtnStudio'),
    tabBtnBatch: document.getElementById('tabBtnBatch'),
    tabBtnLibrary: document.getElementById('tabBtnLibrary'),
    viewStudio: document.getElementById('viewStudio'),
    viewBatch: document.getElementById('viewBatch'),
    viewLibrary: document.getElementById('viewLibrary'),
    libraryCountBadge: document.getElementById('libraryCountBadge'),
    batchBadgeCount: document.getElementById('batchBadgeCount'),
    toastContainer: document.getElementById('toastContainer'),

    // Studio Inputs
    qrNameInput: document.getElementById('qrNameInput'),
    qrCategorySelect: document.getElementById('qrCategorySelect'),
    btnManageCategories: document.getElementById('btnManageCategories'),
    qrTypeSelect: document.getElementById('qrTypeSelect'),
    btnManageTypes: document.getElementById('btnManageTypes'),
    qrUrlInput: document.getElementById('qrUrlInput'),
    btnTestUrl: document.getElementById('btnTestUrl'),
    qrSubtitleInput: document.getElementById('qrSubtitleInput'),
    
    // Type blocks
    modeUrlBlock: document.getElementById('modeUrlBlock'),
    modeWifiBlock: document.getElementById('modeWifiBlock'),
    modeWhatsappBlock: document.getElementById('modeWhatsappBlock'),
    modeVcardBlock: document.getElementById('modeVcardBlock'),
    modeTextBlock: document.getElementById('modeTextBlock'),
    modeCustomBlock: document.getElementById('modeCustomBlock'),
    customTypeLabel: document.getElementById('customTypeLabel'),
    customTypePrefixTag: document.getElementById('customTypePrefixTag'),
    customTypeInput: document.getElementById('customTypeInput'),
    customTypeHint: document.getElementById('customTypeHint'),
    btnTestCustomValue: document.getElementById('btnTestCustomValue'),

    wifiSsid: document.getElementById('wifiSsid'),
    wifiEncryption: document.getElementById('wifiEncryption'),
    wifiPassword: document.getElementById('wifiPassword'),
    waPhone: document.getElementById('waPhone'),
    waMsg: document.getElementById('waMsg'),
    vcardName: document.getElementById('vcardName'),
    vcardPhone: document.getElementById('vcardPhone'),
    vcardEmail: document.getElementById('vcardEmail'),
    vcardOrg: document.getElementById('vcardOrg'),
    plainTextInput: document.getElementById('plainTextInput'),

    // Shapes
    dotTypeSelector: document.getElementById('dotTypeSelector'),
    cornerSquareSelect: document.getElementById('cornerSquareSelect'),
    cornerDotSelect: document.getElementById('cornerDotSelect'),

    // Colors
    themePresetGrid: document.getElementById('themePresetGrid'),
    colorModeSelect: document.getElementById('colorModeSelect'),
    gradientAngle: document.getElementById('gradientAngle'),
    angleValue: document.getElementById('angleValue'),
    gradientAngleGroup: document.getElementById('gradientAngleGroup'),
    primaryColor: document.getElementById('primaryColor'),
    primaryHex: document.getElementById('primaryHex'),
    secondaryColor: document.getElementById('secondaryColor'),
    secondaryHex: document.getElementById('secondaryHex'),
    secondaryColorGroup: document.getElementById('secondaryColorGroup'),
    bgColor: document.getElementById('bgColor'),
    bgHex: document.getElementById('bgHex'),
    transparentBgToggle: document.getElementById('transparentBgToggle'),
    customEyeColorsToggle: document.getElementById('customEyeColorsToggle'),
    customEyeSection: document.getElementById('customEyeSection'),
    eyeFrameColor: document.getElementById('eyeFrameColor'),
    eyeFrameHex: document.getElementById('eyeFrameHex'),
    eyeDotColor: document.getElementById('eyeDotColor'),
    eyeDotHex: document.getElementById('eyeDotHex'),

    // Logo
    logoPresetGrid: document.getElementById('logoPresetGrid'),
    logoFileInput: document.getElementById('logoFileInput'),
    logoDropzone: document.getElementById('logoDropzone'),
    customLogoRow: document.getElementById('customLogoRow'),
    customLogoThumb: document.getElementById('customLogoThumb'),
    customLogoName: document.getElementById('customLogoName'),
    btnRemoveCustomLogo: document.getElementById('btnRemoveCustomLogo'),
    logoSizeRange: document.getElementById('logoSizeRange'),
    logoSizeLabel: document.getElementById('logoSizeLabel'),
    logoMarginRange: document.getElementById('logoMarginRange'),
    logoMarginLabel: document.getElementById('logoMarginLabel'),
    hideBackgroundDotsToggle: document.getElementById('hideBackgroundDotsToggle'),

    // Frame
    frameStyleSelect: document.getElementById('frameStyleSelect'),
    frameTextInput: document.getElementById('frameTextInput'),
    frameBgColor: document.getElementById('frameBgColor'),
    frameBgHex: document.getElementById('frameBgHex'),
    frameTextColor: document.getElementById('frameTextColor'),
    frameTextHex: document.getElementById('frameTextHex'),
    frameColorRow: document.getElementById('frameColorRow'),

    // Preview
    qrCanvasHolder: document.getElementById('qrCanvasHolder'),
    displayCardWrapper: document.getElementById('displayCardWrapper'),
    frameTopBanner: document.getElementById('frameTopBanner'),
    frameTopText: document.getElementById('frameTopText'),
    frameBottomBanner: document.getElementById('frameBottomBanner'),
    frameBottomText: document.getElementById('frameBottomText'),
    cardInfoFooter: document.getElementById('cardInfoFooter'),
    previewCodeName: document.getElementById('previewCodeName'),
    previewCodeSub: document.getElementById('previewCodeSub'),
    previewCodeTag: document.getElementById('previewCodeTag'),
    readabilityBadge: document.getElementById('readabilityBadge'),
    readabilityText: document.getElementById('readabilityText'),

    // Studio Actions
    btnDownloadPng: document.getElementById('btnDownloadPng'),
    btnDownloadSvg: document.getElementById('btnDownloadSvg'),
    btnSaveToLibrary: document.getElementById('btnSaveToLibrary'),
    btnPrintCard: document.getElementById('btnPrintCard'),
    btnQuickPrintSheet: document.getElementById('btnQuickPrintSheet'),
    exportSizeSelect: document.getElementById('exportSizeSelect'),

    // Batch Tab
    btnAddBatchRow: document.getElementById('btnAddBatchRow'),
    btnLoadBatchTemplate: document.getElementById('btnLoadBatchTemplate'),
    btnClearBatchRows: document.getElementById('btnClearBatchRows'),
    btnGenerateAllBatch: document.getElementById('btnGenerateAllBatch'),
    batchTableBody: document.getElementById('batchTableBody'),
    batchRowCountLabel: document.getElementById('batchRowCountLabel'),
    batchResultsSection: document.getElementById('batchResultsSection'),
    batchResultsCount: document.getElementById('batchResultsCount'),
    batchPreviewGrid: document.getElementById('batchPreviewGrid'),
    btnDownloadBatchZip: document.getElementById('btnDownloadBatchZip'),
    btnSaveBatchToLibrary: document.getElementById('btnSaveBatchToLibrary'),

    // Library Tab
    libraryGrid: document.getElementById('libraryGrid'),
    libraryEmptyState: document.getElementById('libraryEmptyState'),
    librarySearchInput: document.getElementById('librarySearchInput'),
    libraryFilterChips: document.getElementById('libraryFilterChips'),
    btnPrintAllCards: document.getElementById('btnPrintAllCards'),
    btnExportLibraryJson: document.getElementById('btnExportLibraryJson'),
    btnEmptyGoStudio: document.getElementById('btnEmptyGoStudio'),
    countAll: document.getElementById('countAll'),

    // Print Modal
    printModalBackdrop: document.getElementById('printModalBackdrop'),
    btnClosePrintModal: document.getElementById('btnClosePrintModal'),
    btnExecuteBrowserPrint: document.getElementById('btnExecuteBrowserPrint'),
    printableSheetContainer: document.getElementById('printableSheetContainer'),
    printCardLayoutSelect: document.getElementById('printCardLayoutSelect'),

    // Category Management Modal
    categoryModalBackdrop: document.getElementById('categoryModalBackdrop'),
    btnCloseCategoryModal: document.getElementById('btnCloseCategoryModal'),
    btnDoneCategoryModal: document.getElementById('btnDoneCategoryModal'),
    btnAddNewCategory: document.getElementById('btnAddNewCategory'),
    newCategoryInput: document.getElementById('newCategoryInput'),
    categoryManageList: document.getElementById('categoryManageList'),
    categoryTotalCount: document.getElementById('categoryTotalCount'),
    btnResetCategories: document.getElementById('btnResetCategories'),

    // Data Type Management Modal
    typeModalBackdrop: document.getElementById('typeModalBackdrop'),
    btnCloseTypeModal: document.getElementById('btnCloseTypeModal'),
    btnDoneTypeModal: document.getElementById('btnDoneTypeModal'),
    btnAddNewType: document.getElementById('btnAddNewType'),
    newTypeName: document.getElementById('newTypeName'),
    newTypePrefix: document.getElementById('newTypePrefix'),
    newTypePlaceholder: document.getElementById('newTypePlaceholder'),
    newTypeHint: document.getElementById('newTypeHint'),
    typeManageList: document.getElementById('typeManageList'),
    typeTotalCount: document.getElementById('typeTotalCount'),
    btnResetTypes: document.getElementById('btnResetTypes'),

    // Supabase Cloud Sync
    btnSupabaseSync: document.getElementById('btnSupabaseSync'),
    cloudStatusDot: document.getElementById('cloudStatusDot'),
    cloudStatusLabel: document.getElementById('cloudStatusLabel'),
    supabaseModalBackdrop: document.getElementById('supabaseModalBackdrop'),
    btnCloseSupabaseModal: document.getElementById('btnCloseSupabaseModal'),
    btnDoneSupabaseModal: document.getElementById('btnDoneSupabaseModal'),
    supabaseUrlInput: document.getElementById('supabaseUrlInput'),
    supabaseKeyInput: document.getElementById('supabaseKeyInput'),
    btnTestSupabaseConn: document.getElementById('btnTestSupabaseConn'),
    btnSaveSupabaseConfig: document.getElementById('btnSaveSupabaseConfig'),
    btnCopySqlSchema: document.getElementById('btnCopySqlSchema'),
    btnManualSyncNow: document.getElementById('btnManualSyncNow'),
    modalStatusOrb: document.getElementById('modalStatusOrb'),
    modalStatusTitle: document.getElementById('modalStatusTitle'),
    modalStatusDesc: document.getElementById('modalStatusDesc')
  };

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  function init() {
    loadCategories();
    loadDataTypes();
    loadSupabaseConfig();
    loadLibraryFromStorage();
    setupNavigation();
    setupStudioEventListeners();
    setupCategoryManagement();
    setupTypeManagement();
    setupSupabaseManagement();
    setupBatchGenerator();
    setupLibraryManager();
    setupPrintModal();

    renderCategoryDropdowns();
    renderTypeDropdown();

    // Initial QR Code Render
    computeDataString();
    initQRCodeInstance();
    renderBatchRows();
    renderLibrary();

    // Check Supabase Cloud Health
    checkSupabaseHealth();
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS (TOASTS)
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
    `;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // NAVIGATION TABS
  // --------------------------------------------------------------------------
  function setupNavigation() {
    const tabs = [
      { btn: elements.tabBtnStudio, view: elements.viewStudio },
      { btn: elements.tabBtnBatch, view: elements.viewBatch },
      { btn: elements.tabBtnLibrary, view: elements.viewLibrary }
    ];

    tabs.forEach(({ btn, view }) => {
      btn.addEventListener('click', () => {
        tabs.forEach(t => {
          t.btn.classList.remove('active');
          t.view.style.display = 'none';
        });
        btn.classList.add('active');
        view.style.display = 'block';

        if (view === elements.viewLibrary) {
          renderLibrary();
        }
      });
    });

    if (elements.btnEmptyGoStudio) {
      elements.btnEmptyGoStudio.addEventListener('click', () => {
        elements.tabBtnStudio.click();
      });
    }

    if (elements.btnQuickPrintSheet) {
      elements.btnQuickPrintSheet.addEventListener('click', () => {
        openPrintModal('all');
      });
    }
  }

  // --------------------------------------------------------------------------
  // DATA STRING FORMATTERS
  // --------------------------------------------------------------------------
  function computeDataString() {
    const type = state.config.type;
    let computed = '';

    if (type === 'url') {
      let val = (elements.qrUrlInput.value || '').trim();
      if (val && !/^https?:\/\//i.test(val) && !val.startsWith('mailto:') && !val.startsWith('tel:') && !val.startsWith('wa.me')) {
        val = 'https://' + val;
      }
      computed = val || 'https://sunseekers.co.za';
      state.config.rawUrl = computed;
    } else if (type === 'wifi') {
      const ssid = (elements.wifiSsid.value || '').trim();
      const enc = elements.wifiEncryption.value;
      const pass = elements.wifiPassword.value || '';
      computed = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    } else if (type === 'whatsapp') {
      const phone = (elements.waPhone.value || '').replace(/[^\d]/g, '');
      const msg = encodeURIComponent(elements.waMsg.value || '');
      computed = `https://wa.me/${phone}?text=${msg}`;
    } else if (type === 'vcard') {
      const name = elements.vcardName.value || 'Sunseekers Staff';
      const phone = elements.vcardPhone.value || '';
      const email = elements.vcardEmail.value || '';
      const org = elements.vcardOrg.value || 'Sunseekers';
      computed = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    } else if (type === 'text') {
      computed = elements.plainTextInput.value || 'Sunseekers Travel Operations';
    } else {
      // Dynamic or custom data types
      const typeObj = state.dataTypes.find(t => t.id === type);
      const customVal = (elements.customTypeInput ? elements.customTypeInput.value : '').trim();
      if (typeObj) {
        computed = typeObj.prefix ? (typeObj.prefix + customVal) : customVal;
      } else {
        computed = customVal || 'https://sunseekers.co.za';
      }
    }

    state.config.computedData = computed;
    updateLivePreviewText();
  }

  function updateLivePreviewText() {
    elements.previewCodeName.textContent = state.config.name || 'Untitled QR Code';
    elements.previewCodeSub.textContent = state.config.subtitle || '';
    elements.previewCodeTag.textContent = state.config.category || 'Fleet';

    // Update Banner Texts
    elements.frameTopText.textContent = state.config.frameText;
    elements.frameBottomText.textContent = state.config.frameText;
  }

  // --------------------------------------------------------------------------
  // CATEGORIES MANAGEMENT
  // --------------------------------------------------------------------------
  function loadCategories() {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        state.categories = JSON.parse(saved);
      } else {
        state.categories = [...DEFAULT_CATEGORIES];
        saveCategoriesToStorage();
      }
    } catch (e) {
      state.categories = [...DEFAULT_CATEGORIES];
    }
  }

  function saveCategoriesToStorage() {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(state.categories));
    } catch (e) {
      console.warn('Could not save categories to localStorage', e);
    }
  }

  function renderCategoryDropdowns() {
    // 1. Studio Select
    const currentVal = state.config.category;
    elements.qrCategorySelect.innerHTML = '';
    state.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === currentVal) opt.selected = true;
      elements.qrCategorySelect.appendChild(opt);
    });

    if (!state.categories.includes(currentVal) && state.categories.length > 0) {
      state.config.category = state.categories[0];
      elements.qrCategorySelect.value = state.categories[0];
      updateLivePreviewText();
    }

    // 2. Batch Table Category Selects
    renderBatchRows();

    // 3. Library Filter Chips
    renderLibraryFilterChips();
  }

  function renderLibraryFilterChips() {
    if (!elements.libraryFilterChips) return;
    const activeChip = elements.libraryFilterChips.querySelector('.filter-chip.active');
    const currentFilter = activeChip ? activeChip.dataset.filter : 'all';

    elements.libraryFilterChips.innerHTML = `
      <button type="button" class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
        All (<span id="countAll">${state.library.length}</span>)
      </button>
    `;

    state.categories.forEach(cat => {
      const count = state.library.filter(item => item.category === cat).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `filter-chip ${currentFilter === cat ? 'active' : ''}`;
      btn.dataset.filter = cat;
      btn.textContent = `${cat} (${count})`;
      btn.addEventListener('click', () => {
        elements.libraryFilterChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        renderLibrary();
      });
      elements.libraryFilterChips.appendChild(btn);
    });

    const allBtn = elements.libraryFilterChips.querySelector('[data-filter="all"]');
    if (allBtn) {
      allBtn.addEventListener('click', () => {
        elements.libraryFilterChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        allBtn.classList.add('active');
        renderLibrary();
      });
    }
  }

  function setupCategoryManagement() {
    elements.btnManageCategories.addEventListener('click', openCategoryModal);
    elements.btnCloseCategoryModal.addEventListener('click', closeCategoryModal);
    elements.btnDoneCategoryModal.addEventListener('click', closeCategoryModal);
    elements.categoryModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.categoryModalBackdrop) closeCategoryModal();
    });

    elements.btnAddNewCategory.addEventListener('click', handleAddNewCategory);
    elements.newCategoryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddNewCategory();
      }
    });

    elements.btnResetCategories.addEventListener('click', () => {
      if (confirm('Reset all categories back to default Sunseekers categories?')) {
        state.categories = [...DEFAULT_CATEGORIES];
        saveCategoriesToStorage();
        renderCategoryDropdowns();
        renderCategoryManageList();
        showToast('Categories reset to defaults', 'info');
      }
    });
  }

  function openCategoryModal() {
    elements.categoryModalBackdrop.style.display = 'flex';
    elements.newCategoryInput.value = '';
    renderCategoryManageList();
  }

  function closeCategoryModal() {
    elements.categoryModalBackdrop.style.display = 'none';
  }

  function renderCategoryManageList() {
    elements.categoryTotalCount.textContent = state.categories.length;
    elements.categoryManageList.innerHTML = '';

    state.categories.forEach((cat, index) => {
      const usageCount = state.library.filter(item => item.category === cat).length;
      const row = document.createElement('div');
      row.className = 'manage-item';
      row.innerHTML = `
        <div class="manage-item-info">
          <span class="manage-item-title">${escapeHtml(cat)}</span>
          <span class="manage-item-badge">${usageCount} in Library</span>
        </div>
        <button type="button" class="manage-del-btn" data-index="${index}" title="Delete category">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      `;

      row.querySelector('.manage-del-btn').addEventListener('click', () => {
        if (state.categories.length <= 1) {
          showToast('You must have at least one category.', 'danger');
          return;
        }
        const removedCat = state.categories.splice(index, 1)[0];
        saveCategoriesToStorage();
        renderCategoryDropdowns();
        renderCategoryManageList();
        showToast(`Deleted category "${removedCat}"`, 'info');
      });

      elements.categoryManageList.appendChild(row);
    });
  }

  function handleAddNewCategory() {
    const val = elements.newCategoryInput.value.trim();
    if (!val) {
      showToast('Please enter a category name.', 'danger');
      return;
    }
    if (state.categories.some(c => c.toLowerCase() === val.toLowerCase())) {
      showToast(`Category "${val}" already exists.`, 'danger');
      return;
    }

    state.categories.push(val);
    saveCategoriesToStorage();
    renderCategoryDropdowns();
    renderCategoryManageList();
    elements.newCategoryInput.value = '';
    elements.qrCategorySelect.value = val;
    state.config.category = val;
    updateLivePreviewText();
    showToast(`Created category "${val}"!`, 'success');
  }

  // --------------------------------------------------------------------------
  // DATA TYPES MANAGEMENT
  // --------------------------------------------------------------------------
  function loadDataTypes() {
    try {
      const saved = localStorage.getItem(TYPES_STORAGE_KEY);
      if (saved) {
        state.dataTypes = JSON.parse(saved);
      } else {
        state.dataTypes = [...DEFAULT_DATA_TYPES];
        saveTypesToStorage();
      }
    } catch (e) {
      state.dataTypes = [...DEFAULT_DATA_TYPES];
    }
  }

  function saveTypesToStorage() {
    try {
      localStorage.setItem(TYPES_STORAGE_KEY, JSON.stringify(state.dataTypes));
    } catch (e) {
      console.warn('Could not save data types to localStorage', e);
    }
  }

  function renderTypeDropdown() {
    const currentVal = state.config.type;
    elements.qrTypeSelect.innerHTML = '';

    state.dataTypes.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      if (t.id === currentVal) opt.selected = true;
      elements.qrTypeSelect.appendChild(opt);
    });

    if (!state.dataTypes.some(t => t.id === currentVal) && state.dataTypes.length > 0) {
      switchDataType(state.dataTypes[0].id);
    } else {
      switchDataType(currentVal);
    }
  }

  function switchDataType(typeId) {
    state.config.type = typeId;
    elements.qrTypeSelect.value = typeId;

    const isUrl = typeId === 'url';
    const isWifi = typeId === 'wifi';
    const isWhatsapp = typeId === 'whatsapp';
    const isVcard = typeId === 'vcard';
    const isText = typeId === 'text';

    elements.modeUrlBlock.style.display = isUrl ? 'block' : 'none';
    elements.modeWifiBlock.style.display = isWifi ? 'block' : 'none';
    elements.modeWhatsappBlock.style.display = isWhatsapp ? 'block' : 'none';
    elements.modeVcardBlock.style.display = isVcard ? 'block' : 'none';
    elements.modeTextBlock.style.display = isText ? 'block' : 'none';

    if (!isUrl && !isWifi && !isWhatsapp && !isVcard && !isText) {
      elements.modeCustomBlock.style.display = 'block';
      const typeObj = state.dataTypes.find(t => t.id === typeId);
      if (typeObj) {
        elements.customTypeLabel.textContent = typeObj.name;
        elements.customTypePrefixTag.textContent = typeObj.prefix ? `Prefix: ${typeObj.prefix}` : 'Direct Value';
        elements.customTypeInput.placeholder = typeObj.placeholder || 'Enter value';
        elements.customTypeHint.textContent = typeObj.hint || '';
      }
    } else {
      elements.modeCustomBlock.style.display = 'none';
    }

    requestQRUpdate();
  }

  function setupTypeManagement() {
    elements.btnManageTypes.addEventListener('click', openTypeModal);
    elements.btnCloseTypeModal.addEventListener('click', closeTypeModal);
    elements.btnDoneTypeModal.addEventListener('click', closeTypeModal);
    elements.typeModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.typeModalBackdrop) closeTypeModal();
    });

    elements.btnAddNewType.addEventListener('click', handleAddNewType);

    elements.btnResetTypes.addEventListener('click', () => {
      if (confirm('Reset all data types back to defaults?')) {
        state.dataTypes = [...DEFAULT_DATA_TYPES];
        saveTypesToStorage();
        renderTypeDropdown();
        renderTypeManageList();
        showToast('Data types reset to defaults', 'info');
      }
    });

    // Custom Type Test Button
    if (elements.btnTestCustomValue) {
      elements.btnTestCustomValue.addEventListener('click', () => {
        computeDataString();
        if (state.config.computedData) {
          if (/^https?:\/\//i.test(state.config.computedData)) {
            window.open(state.config.computedData, '_blank');
          } else {
            showToast(`Payload: ${state.config.computedData}`, 'info');
          }
        }
      });
    }

    if (elements.customTypeInput) {
      elements.customTypeInput.addEventListener('input', requestQRUpdate);
    }
  }

  function openTypeModal() {
    elements.typeModalBackdrop.style.display = 'flex';
    elements.newTypeName.value = '';
    elements.newTypePrefix.value = '';
    elements.newTypePlaceholder.value = '';
    elements.newTypeHint.value = '';
    renderTypeManageList();
  }

  function closeTypeModal() {
    elements.typeModalBackdrop.style.display = 'none';
  }

  function renderTypeManageList() {
    elements.typeTotalCount.textContent = state.dataTypes.length;
    elements.typeManageList.innerHTML = '';

    state.dataTypes.forEach((t, index) => {
      const row = document.createElement('div');
      row.className = 'manage-item';
      const badgeText = t.prefix ? t.prefix : 'Direct';
      row.innerHTML = `
        <div class="manage-item-info">
          <div>
            <div class="manage-item-title">${escapeHtml(t.name)}</div>
            <div class="manage-item-sub">${escapeHtml(t.hint || t.placeholder || '')}</div>
          </div>
          <span class="manage-item-badge">${escapeHtml(badgeText)}</span>
        </div>
        <button type="button" class="manage-del-btn" data-index="${index}" title="Delete data type">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      `;

      row.querySelector('.manage-del-btn').addEventListener('click', () => {
        if (state.dataTypes.length <= 1) {
          showToast('You must have at least one data type.', 'danger');
          return;
        }
        const removed = state.dataTypes.splice(index, 1)[0];
        saveTypesToStorage();
        renderTypeDropdown();
        renderTypeManageList();
        showToast(`Deleted data type "${removed.name}"`, 'info');
      });

      elements.typeManageList.appendChild(row);
    });
  }

  function handleAddNewType() {
    const name = elements.newTypeName.value.trim();
    const prefix = elements.newTypePrefix.value.trim();
    const placeholder = elements.newTypePlaceholder.value.trim();
    const hint = elements.newTypeHint.value.trim();

    if (!name) {
      showToast('Please enter a data type name.', 'danger');
      return;
    }

    const id = 'type_' + Date.now();
    const newType = {
      id: id,
      name: name,
      prefix: prefix,
      placeholder: placeholder || 'Enter value',
      hint: hint || (prefix ? `Value will be prefixed with "${prefix}"` : ''),
      isBuiltin: false
    };

    state.dataTypes.push(newType);
    saveTypesToStorage();
    renderTypeDropdown();
    renderTypeManageList();

    elements.newTypeName.value = '';
    elements.newTypePrefix.value = '';
    elements.newTypePlaceholder.value = '';
    elements.newTypeHint.value = '';

    switchDataType(id);
    showToast(`Created data type "${name}"!`, 'success');
  }

  // --------------------------------------------------------------------------
  // SUPABASE CLOUD SYNC
  // --------------------------------------------------------------------------
  function loadSupabaseConfig() {
    try {
      const saved = localStorage.getItem(SUPABASE_STORAGE_KEY);
      if (saved) {
        state.supabase = { ...state.supabase, ...JSON.parse(saved) };
      } else {
        state.supabase.url = DEFAULT_SUPABASE_CONFIG.url;
        state.supabase.key = DEFAULT_SUPABASE_CONFIG.key;
        saveSupabaseConfig();
      }
    } catch (e) {
      state.supabase.url = DEFAULT_SUPABASE_CONFIG.url;
      state.supabase.key = DEFAULT_SUPABASE_CONFIG.key;
    }

    if (elements.supabaseUrlInput) elements.supabaseUrlInput.value = state.supabase.url;
    if (elements.supabaseKeyInput) elements.supabaseKeyInput.value = state.supabase.key;
  }

  function saveSupabaseConfig() {
    try {
      localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify({
        url: state.supabase.url,
        key: state.supabase.key
      }));
    } catch (e) {
      console.warn('Could not save Supabase config', e);
    }
  }

  function setupSupabaseManagement() {
    elements.btnSupabaseSync.addEventListener('click', openSupabaseModal);
    elements.btnCloseSupabaseModal.addEventListener('click', closeSupabaseModal);
    elements.btnDoneSupabaseModal.addEventListener('click', closeSupabaseModal);
    elements.supabaseModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.supabaseModalBackdrop) closeSupabaseModal();
    });

    elements.btnSaveSupabaseConfig.addEventListener('click', () => {
      let rawUrl = (elements.supabaseUrlInput.value || '').trim();
      rawUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
      const rawKey = (elements.supabaseKeyInput.value || '').trim();

      state.supabase.url = rawUrl;
      state.supabase.key = rawKey;
      saveSupabaseConfig();

      showToast('Saved Supabase credentials. Testing...', 'info');
      checkSupabaseHealth(true);
    });

    elements.btnTestSupabaseConn.addEventListener('click', () => {
      checkSupabaseHealth(true);
    });

    elements.btnCopySqlSchema.addEventListener('click', copySqlSchemaToClipboard);
    elements.btnManualSyncNow.addEventListener('click', syncAllToSupabase);
  }

  function openSupabaseModal() {
    elements.supabaseModalBackdrop.style.display = 'flex';
    elements.supabaseUrlInput.value = state.supabase.url;
    elements.supabaseKeyInput.value = state.supabase.key;
    checkSupabaseHealth(false);
  }

  function closeSupabaseModal() {
    elements.supabaseModalBackdrop.style.display = 'none';
  }

  async function checkSupabaseHealth(showToasts = false) {
    const url = state.supabase.url;
    const key = state.supabase.key;

    if (!url || !key) {
      updateCloudStatus('disconnected', 'Disconnected', 'No Supabase credentials configured.');
      return;
    }

    try {
      // Test querying the qr_codes endpoint
      const endpoint = `${url}/rest/v1/qr_codes?select=id&limit=1`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });

      if (res.status === 200) {
        state.supabase.connected = true;
        state.supabase.tablesReady = true;
        updateCloudStatus('connected', 'Supabase Cloud Connected', 'Database tables verified & real-time sync active.');
        if (showToasts) showToast('Connected to Supabase PostgreSQL cluster!', 'success');

        // Automatically pull cloud items and sync
        await fetchCloudQRCodes();
      } else if (res.status === 404) {
        // Connected to Supabase, but schema tables haven't been created yet!
        state.supabase.connected = true;
        state.supabase.tablesReady = false;
        updateCloudStatus('pending', 'Schema Setup Needed', 'Connected to Supabase! Run the SQL Setup Script in your SQL Editor to create tables.');
        if (showToasts) showToast('Connected to Supabase! Run the SQL schema to create tables.', 'info');
      } else {
        const errorText = await res.text();
        state.supabase.connected = false;
        state.supabase.tablesReady = false;
        updateCloudStatus('error', 'Auth Failed', `Supabase returned status ${res.status}. Check publishable key.`);
        if (showToasts) showToast(`Supabase error (${res.status}): ${errorText}`, 'danger');
      }
    } catch (err) {
      state.supabase.connected = false;
      state.supabase.tablesReady = false;
      updateCloudStatus('error', 'Connection Error', 'Unable to reach Supabase URL. Check your internet connection.');
      if (showToasts) showToast('Failed to reach Supabase: ' + err.message, 'danger');
    }
  }

  function updateCloudStatus(status, title, desc) {
    elements.cloudStatusDot.className = 'cloud-dot';
    elements.modalStatusOrb.className = 'status-orb';

    if (status === 'connected') {
      elements.cloudStatusDot.classList.add('connected');
      elements.modalStatusOrb.classList.add('connected');
      elements.cloudStatusLabel.textContent = 'Cloud Synced';
    } else if (status === 'pending') {
      elements.cloudStatusDot.classList.add('pending');
      elements.modalStatusOrb.classList.add('pending');
      elements.cloudStatusLabel.textContent = 'Setup Schema';
    } else {
      elements.cloudStatusDot.classList.add('error');
      elements.modalStatusOrb.classList.add('error');
      elements.cloudStatusLabel.textContent = 'Cloud Offline';
    }

    elements.modalStatusTitle.textContent = title;
    elements.modalStatusDesc.textContent = desc;
  }

  async function fetchCloudQRCodes() {
    if (!state.supabase.connected || !state.supabase.tablesReady) return;
    try {
      const url = `${state.supabase.url}/rest/v1/qr_codes?select=*&order=created_at.desc`;
      const res = await fetch(url, {
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`
        }
      });
      if (res.ok) {
        const cloudCodes = await res.json();
        if (Array.isArray(cloudCodes) && cloudCodes.length) {
          // Merge with local library without duplicates
          const localIds = new Set(state.library.map(i => i.id));
          let newItems = 0;
          cloudCodes.forEach(cc => {
            if (!localIds.has(cc.id)) {
              state.library.unshift({
                id: cc.id,
                name: cc.name,
                category: cc.category,
                url: cc.url,
                subtitle: cc.subtitle,
                createdAt: cc.created_at,
                configSnapshot: cc.config_snapshot
              });
              newItems++;
            }
          });
          if (newItems > 0) {
            saveLibraryToStorage();
            renderLibrary();
            showToast(`Synchronized ${newItems} QR codes from Supabase cloud!`, 'success');
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching cloud codes:', e);
    }
  }

  async function syncSingleQRCodeToSupabase(item) {
    if (!state.supabase.connected || !state.supabase.tablesReady) return;
    try {
      const payload = {
        id: item.id,
        name: item.name,
        category: item.category || 'Fleet & Buses',
        url: item.url,
        subtitle: item.subtitle || '',
        config_snapshot: item.configSnapshot || {},
        created_at: item.createdAt || new Date().toISOString()
      };

      await fetch(`${state.supabase.url}/rest/v1/qr_codes`, {
        method: 'POST',
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Cloud sync error for single item:', e);
    }
  }

  async function deleteSingleQRCodeFromSupabase(id) {
    if (!state.supabase.connected || !state.supabase.tablesReady) return;
    try {
      await fetch(`${state.supabase.url}/rest/v1/qr_codes?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`
        }
      });
    } catch (e) {
      console.warn('Cloud delete error:', e);
    }
  }

  async function syncAllToSupabase() {
    if (!state.supabase.connected || !state.supabase.tablesReady) {
      showToast('Cannot sync: tables not ready in Supabase. Run SQL schema first.', 'danger');
      return;
    }

    try {
      showToast('Uploading all library codes to Supabase...', 'info');
      let count = 0;
      for (const item of state.library) {
        await syncSingleQRCodeToSupabase(item);
        count++;
      }
      showToast(`Uploaded ${count} QR codes to Supabase!`, 'success');
    } catch (e) {
      showToast('Sync error: ' + e.message, 'danger');
    }
  }

  async function copySqlSchemaToClipboard() {
    const sqlContent = `-- SUNSEEKERS QR CODE GENERATOR - SUPABASE SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.qr_codes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Fleet & Buses',
    url TEXT NOT NULL,
    subtitle TEXT,
    config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.qr_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.qr_data_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    prefix TEXT DEFAULT '',
    placeholder TEXT DEFAULT '',
    hint TEXT DEFAULT '',
    is_builtin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_data_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on qr_codes" ON public.qr_codes;
CREATE POLICY "Allow anon all on qr_codes" ON public.qr_codes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on qr_categories" ON public.qr_categories;
CREATE POLICY "Allow anon all on qr_categories" ON public.qr_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on qr_data_types" ON public.qr_data_types;
CREATE POLICY "Allow anon all on qr_data_types" ON public.qr_data_types FOR ALL USING (true) WITH CHECK (true);`;

    try {
      await navigator.clipboard.writeText(sqlContent);
      showToast('SQL Schema copied to clipboard! Paste in Supabase SQL Editor and run.', 'success');
    } catch (e) {
      showToast('Could not auto-copy. Please open supabase_schema.sql directly.', 'info');
    }
  }

  // --------------------------------------------------------------------------
  // QR CODE STYLING BUILDER & ENGINE
  // --------------------------------------------------------------------------
  function buildQROptions(customSize = 300) {
    const c = state.config;

    // Build Dots Options
    const dotsOptions = {
      type: c.dotsType,
      roundSize: true
    };

    if (c.colorMode === 'solid') {
      dotsOptions.color = c.primaryColor;
    } else if (c.colorMode === 'linear') {
      dotsOptions.gradient = {
        type: 'linear',
        rotation: (c.gradientAngle * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: c.primaryColor },
          { offset: 1, color: c.secondaryColor }
        ]
      };
    } else if (c.colorMode === 'radial') {
      dotsOptions.gradient = {
        type: 'radial',
        colorStops: [
          { offset: 0, color: c.primaryColor },
          { offset: 1, color: c.secondaryColor }
        ]
      };
    }

    // Build Corner Eye Options
    const cornersSquareOptions = {
      type: c.cornersSquareType
    };
    const cornersDotOptions = {
      type: c.cornersDotType
    };

    if (c.customEyeColors) {
      cornersSquareOptions.color = c.eyeFrameColor;
      cornersDotOptions.color = c.eyeDotColor;
    } else {
      // Inherit main color or gradient
      if (dotsOptions.gradient) {
        cornersSquareOptions.gradient = dotsOptions.gradient;
        cornersDotOptions.gradient = dotsOptions.gradient;
      } else {
        cornersSquareOptions.color = c.primaryColor;
        cornersDotOptions.color = c.primaryColor;
      }
    }

    // Background
    const backgroundOptions = {
      color: c.transparentBg ? 'rgba(0,0,0,0)' : c.bgColor
    };

    // Image / Logo
    const imageOptions = {
      hideBackgroundDots: c.hideBackgroundDots,
      imageSize: c.logoSize,
      margin: c.logoMargin,
      crossOrigin: 'anonymous'
    };

    return {
      width: customSize,
      height: customSize,
      data: c.computedData,
      margin: 12,
      qrOptions: {
        errorCorrectionLevel: 'Q' // High level enables robust scans with logos
      },
      image: c.logoSrc || undefined,
      imageOptions: imageOptions,
      dotsOptions: dotsOptions,
      cornersSquareOptions: cornersSquareOptions,
      cornersDotOptions: cornersDotOptions,
      backgroundOptions: backgroundOptions
    };
  }

  function initQRCodeInstance() {
    if (typeof window.QRCodeStyling === 'undefined') {
      console.error('QRCodeStyling library not loaded');
      return;
    }

    elements.qrCanvasHolder.innerHTML = '';
    const options = buildQROptions(280);
    qrCodeInstance = new window.QRCodeStyling(options);
    qrCodeInstance.append(elements.qrCanvasHolder);

    updateFrameDisplay();
  }

  function requestQRUpdate() {
    if (updateDebounceTimeout) clearTimeout(updateDebounceTimeout);
    updateDebounceTimeout = setTimeout(() => {
      computeDataString();
      if (!qrCodeInstance) {
        initQRCodeInstance();
      } else {
        const options = buildQROptions(280);
        qrCodeInstance.update(options);
      }
      updateFrameDisplay();
    }, 60);
  }

  function updateFrameDisplay() {
    const style = state.config.frameStyle;
    const frameBg = state.config.frameBgColor;
    const frameText = state.config.frameTextColor;

    elements.frameTopBanner.style.backgroundColor = frameBg;
    elements.frameTopBanner.style.color = frameText;
    elements.frameBottomBanner.style.backgroundColor = frameBg;
    elements.frameBottomBanner.style.color = frameText;

    if (style === 'none') {
      elements.frameTopBanner.style.display = 'none';
      elements.frameBottomBanner.style.display = 'none';
      elements.cardInfoFooter.style.display = 'none';
      elements.displayCardWrapper.style.padding = '12px';
    } else if (style === 'bottom-banner') {
      elements.frameTopBanner.style.display = 'none';
      elements.frameBottomBanner.style.display = 'block';
      elements.cardInfoFooter.style.display = 'block';
      elements.displayCardWrapper.style.padding = '18px';
    } else if (style === 'top-badge') {
      elements.frameTopBanner.style.display = 'block';
      elements.frameBottomBanner.style.display = 'none';
      elements.cardInfoFooter.style.display = 'block';
      elements.displayCardWrapper.style.padding = '18px';
    } else if (style === 'full-card') {
      elements.frameTopBanner.style.display = 'block';
      elements.frameBottomBanner.style.display = 'block';
      elements.cardInfoFooter.style.display = 'block';
      elements.displayCardWrapper.style.padding = '22px';
    }
  }

  // --------------------------------------------------------------------------
  // STUDIO EVENT LISTENERS
  // --------------------------------------------------------------------------
  function setupStudioEventListeners() {
    // 1. Text Inputs
    elements.qrNameInput.addEventListener('input', (e) => {
      state.config.name = e.target.value.trim();
      updateLivePreviewText();
    });

    elements.qrSubtitleInput.addEventListener('input', (e) => {
      state.config.subtitle = e.target.value.trim();
      updateLivePreviewText();
    });

    elements.qrCategorySelect.addEventListener('change', (e) => {
      state.config.category = e.target.value;
      updateLivePreviewText();
    });

    // 2. Data Type Selection
    elements.qrTypeSelect.addEventListener('change', (e) => {
      switchDataType(e.target.value);
    });

    // Input listeners for dynamic blocks
    [
      elements.qrUrlInput,
      elements.wifiSsid, elements.wifiEncryption, elements.wifiPassword,
      elements.waPhone, elements.waMsg,
      elements.vcardName, elements.vcardPhone, elements.vcardEmail, elements.vcardOrg,
      elements.plainTextInput,
      elements.customTypeInput
    ].forEach(input => {
      if (input) input.addEventListener('input', requestQRUpdate);
    });

    // Quick Presets
    document.querySelectorAll('.quick-chips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        elements.qrUrlInput.value = chip.dataset.url;
        requestQRUpdate();
      });
    });

    // Test Link Button
    elements.btnTestUrl.addEventListener('click', () => {
      computeDataString();
      if (state.config.rawUrl) {
        window.open(state.config.rawUrl, '_blank');
      }
    });

    // 3. Shapes & Pattern
    elements.dotTypeSelector.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.dotTypeSelector.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.config.dotsType = btn.dataset.value;
        requestQRUpdate();
      });
    });

    elements.cornerSquareSelect.addEventListener('change', (e) => {
      state.config.cornersSquareType = e.target.value;
      requestQRUpdate();
    });

    elements.cornerDotSelect.addEventListener('change', (e) => {
      state.config.cornersDotType = e.target.value;
      requestQRUpdate();
    });

    // 4. Color Theme Presets
    elements.themePresetGrid.querySelectorAll('.theme-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        elements.themePresetGrid.querySelectorAll('.theme-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const theme = THEME_PRESETS[pill.dataset.theme];
        if (theme) {
          state.config.colorMode = theme.mode;
          elements.colorModeSelect.value = theme.mode;
          state.config.gradientAngle = theme.angle;
          elements.gradientAngle.value = theme.angle;
          elements.angleValue.textContent = theme.angle + '°';

          state.config.primaryColor = theme.primary;
          elements.primaryColor.value = theme.primary;
          elements.primaryHex.textContent = theme.primary;

          state.config.secondaryColor = theme.secondary;
          elements.secondaryColor.value = theme.secondary;
          elements.secondaryHex.textContent = theme.secondary;

          state.config.bgColor = theme.bg;
          elements.bgColor.value = theme.bg;
          elements.bgHex.textContent = theme.bg;

          state.config.customEyeColors = theme.customEyes;
          elements.customEyeColorsToggle.checked = theme.customEyes;
          elements.customEyeSection.style.display = theme.customEyes ? 'grid' : 'none';

          state.config.eyeFrameColor = theme.eyeFrame;
          elements.eyeFrameColor.value = theme.eyeFrame;
          elements.eyeFrameHex.textContent = theme.eyeFrame;

          state.config.eyeDotColor = theme.eyeDot;
          elements.eyeDotColor.value = theme.eyeDot;
          elements.eyeDotHex.textContent = theme.eyeDot;

          state.config.frameBgColor = theme.frameBg;
          elements.frameBgColor.value = theme.frameBg;
          elements.frameBgHex.textContent = theme.frameBg;

          elements.secondaryColorGroup.style.display = theme.mode === 'solid' ? 'none' : 'block';
          elements.gradientAngleGroup.style.display = theme.mode === 'linear' ? 'block' : 'none';

          requestQRUpdate();
        }
      });
    });

    // Color Fill Mode
    elements.colorModeSelect.addEventListener('change', (e) => {
      state.config.colorMode = e.target.value;
      elements.secondaryColorGroup.style.display = state.config.colorMode === 'solid' ? 'none' : 'block';
      elements.gradientAngleGroup.style.display = state.config.colorMode === 'linear' ? 'block' : 'none';
      requestQRUpdate();
    });

    elements.gradientAngle.addEventListener('input', (e) => {
      state.config.gradientAngle = parseInt(e.target.value, 10);
      elements.angleValue.textContent = `${state.config.gradientAngle}°`;
      requestQRUpdate();
    });

    elements.primaryColor.addEventListener('input', (e) => {
      state.config.primaryColor = e.target.value;
      elements.primaryHex.textContent = e.target.value.toUpperCase();
      requestQRUpdate();
    });

    elements.secondaryColor.addEventListener('input', (e) => {
      state.config.secondaryColor = e.target.value;
      elements.secondaryHex.textContent = e.target.value.toUpperCase();
      requestQRUpdate();
    });

    elements.bgColor.addEventListener('input', (e) => {
      state.config.bgColor = e.target.value;
      elements.bgHex.textContent = e.target.value.toUpperCase();
      requestQRUpdate();
    });

    elements.transparentBgToggle.addEventListener('change', (e) => {
      state.config.transparentBg = e.target.checked;
      requestQRUpdate();
    });

    elements.customEyeColorsToggle.addEventListener('change', (e) => {
      state.config.customEyeColors = e.target.checked;
      elements.customEyeSection.style.display = e.target.checked ? 'grid' : 'none';
      requestQRUpdate();
    });

    elements.eyeFrameColor.addEventListener('input', (e) => {
      state.config.eyeFrameColor = e.target.value;
      elements.eyeFrameHex.textContent = e.target.value.toUpperCase();
      requestQRUpdate();
    });

    elements.eyeDotColor.addEventListener('input', (e) => {
      state.config.eyeDotColor = e.target.value;
      elements.eyeDotHex.textContent = e.target.value.toUpperCase();
      requestQRUpdate();
    });

    // 5. Logo Selection & Upload
    elements.logoPresetGrid.querySelectorAll('.logo-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.logoPresetGrid.querySelectorAll('.logo-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.config.logoSrc = btn.dataset.src;
        elements.customLogoRow.style.display = 'none';
        requestQRUpdate();
      });
    });

    // Custom Logo File Upload
    elements.logoDropzone.addEventListener('click', () => elements.logoFileInput.click());
    elements.logoFileInput.addEventListener('change', handleLogoFileSelect);

    // Drag and drop for logo
    elements.logoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.logoDropzone.classList.add('drag-over');
    });
    elements.logoDropzone.addEventListener('dragleave', () => elements.logoDropzone.classList.remove('drag-over'));
    elements.logoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.logoDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleLogoFile(e.dataTransfer.files[0]);
      }
    });

    elements.btnRemoveCustomLogo.addEventListener('click', (e) => {
      e.stopPropagation();
      state.config.logoSrc = '';
      elements.customLogoRow.style.display = 'none';
      elements.logoFileInput.value = '';
      elements.logoPresetGrid.querySelectorAll('.logo-preset-btn').forEach(b => b.classList.remove('active'));
      requestQRUpdate();
    });

    elements.logoSizeRange.addEventListener('input', (e) => {
      state.config.logoSize = parseFloat(e.target.value);
      elements.logoSizeLabel.textContent = `${Math.round(state.config.logoSize * 100)}%`;
      requestQRUpdate();
    });

    elements.logoMarginRange.addEventListener('input', (e) => {
      state.config.logoMargin = parseInt(e.target.value, 10);
      elements.logoMarginLabel.textContent = `${state.config.logoMargin}px`;
      requestQRUpdate();
    });

    elements.hideBackgroundDotsToggle.addEventListener('change', (e) => {
      state.config.hideBackgroundDots = e.target.checked;
      requestQRUpdate();
    });

    // 6. Frame Controls
    elements.frameStyleSelect.addEventListener('change', (e) => {
      state.config.frameStyle = e.target.value;
      updateFrameDisplay();
    });

    elements.frameTextInput.addEventListener('input', (e) => {
      state.config.frameText = e.target.value.toUpperCase();
      updateLivePreviewText();
    });

    elements.frameBgColor.addEventListener('input', (e) => {
      state.config.frameBgColor = e.target.value;
      elements.frameBgHex.textContent = e.target.value.toUpperCase();
      updateFrameDisplay();
    });

    elements.frameTextColor.addEventListener('input', (e) => {
      state.config.frameTextColor = e.target.value;
      elements.frameTextHex.textContent = e.target.value.toUpperCase();
      updateFrameDisplay();
    });

    // 7. Resolution & Export Handlers
    elements.exportSizeSelect.addEventListener('change', (e) => {
      state.config.exportSize = parseInt(e.target.value, 10);
    });

    elements.btnDownloadPng.addEventListener('click', handleDownloadPng);
    elements.btnDownloadSvg.addEventListener('click', handleDownloadSvg);
    elements.btnSaveToLibrary.addEventListener('click', handleSaveStudioToLibrary);
    elements.btnPrintCard.addEventListener('click', () => openPrintModal('studio'));
  }

  function handleLogoFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
      handleLogoFile(e.target.files[0]);
    }
  }

  function handleLogoFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, SVG, WebP)', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target.result;
      state.config.logoSrc = dataUrl;
      elements.customLogoThumb.src = dataUrl;
      elements.customLogoName.textContent = file.name;
      elements.customLogoRow.style.display = 'flex';

      elements.logoPresetGrid.querySelectorAll('.logo-preset-btn').forEach(b => b.classList.remove('active'));
      requestQRUpdate();
      showToast(`Custom logo "${file.name}" applied`, 'success');
    };
    reader.readAsDataURL(file);
  }

  // --------------------------------------------------------------------------
  // DOWNLOAD & EXPORT LOGIC
  // --------------------------------------------------------------------------
  async function handleDownloadPng() {
    try {
      const size = state.config.exportSize || 1200;
      const filename = sanitizeFilename(state.config.name || 'Sunseekers-QR') + '.png';

      // If frame is enabled, render framed composite canvas
      if (state.config.frameStyle !== 'none') {
        const compositeCanvas = await createFramedCompositeCanvas(size);
        const link = document.createElement('a');
        link.download = filename;
        link.href = compositeCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // High-res QR directly
        const exportOptions = buildQROptions(size);
        const exportQR = new window.QRCodeStyling(exportOptions);
        await exportQR.download({ name: sanitizeFilename(state.config.name || 'Sunseekers-QR'), extension: 'png' });
      }

      showToast(`Downloaded ${filename} successfully!`, 'success');
    } catch (err) {
      console.error('PNG download error:', err);
      showToast('Failed to download PNG: ' + err.message, 'danger');
    }
  }

  async function handleDownloadSvg() {
    try {
      const filename = sanitizeFilename(state.config.name || 'Sunseekers-QR');
      const exportOptions = buildQROptions(800);
      const exportQR = new window.QRCodeStyling(exportOptions);
      await exportQR.download({ name: filename, extension: 'svg' });
      showToast(`Downloaded ${filename}.svg vector successfully!`, 'success');
    } catch (err) {
      console.error('SVG download error:', err);
      showToast('Failed to download SVG: ' + err.message, 'danger');
    }
  }

  // Composite canvas with frame badge, branding, and QR
  async function createFramedCompositeCanvas(targetWidth = 1200) {
    const scale = targetWidth / 300;
    const padding = 24 * scale;
    const bannerHeight = 44 * scale;
    const footerHeight = 60 * scale;

    const qrSize = targetWidth - (padding * 2);
    let totalHeight = padding + qrSize + padding;

    if (state.config.frameStyle === 'top-badge' || state.config.frameStyle === 'full-card') {
      totalHeight += bannerHeight + (10 * scale);
    }
    if (state.config.frameStyle === 'bottom-banner' || state.config.frameStyle === 'full-card') {
      totalHeight += bannerHeight + (10 * scale);
    }
    totalHeight += footerHeight;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    // White Card Background
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 0, 0, targetWidth, totalHeight, 18 * scale);
    ctx.fill();

    let currentY = padding;

    // Top Banner
    if (state.config.frameStyle === 'top-badge' || state.config.frameStyle === 'full-card') {
      ctx.fillStyle = state.config.frameBgColor || '#F57C00';
      roundRect(ctx, padding, currentY, qrSize, bannerHeight, 8 * scale);
      ctx.fill();

      ctx.fillStyle = state.config.frameTextColor || '#FFFFFF';
      ctx.font = `bold ${Math.round(20 * scale)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.config.frameText || 'SCAN TO BOOK', targetWidth / 2, currentY + (bannerHeight / 2));

      currentY += bannerHeight + (12 * scale);
    }

    // Render High-Res QR onto an offscreen canvas
    const exportOptions = buildQROptions(qrSize);
    const exportQR = new window.QRCodeStyling(exportOptions);
    const qrRawCanvas = await exportQR._getElement('png');
    ctx.drawImage(qrRawCanvas, padding, currentY, qrSize, qrSize);

    currentY += qrSize + (12 * scale);

    // Bottom Banner
    if (state.config.frameStyle === 'bottom-banner' || state.config.frameStyle === 'full-card') {
      ctx.fillStyle = state.config.frameBgColor || '#F57C00';
      roundRect(ctx, padding, currentY, qrSize, bannerHeight, 8 * scale);
      ctx.fill();

      ctx.fillStyle = state.config.frameTextColor || '#FFFFFF';
      ctx.font = `bold ${Math.round(20 * scale)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.config.frameText || 'SCAN TO BOOK', targetWidth / 2, currentY + (bannerHeight / 2));

      currentY += bannerHeight + (14 * scale);
    }

    // Business Info Footer
    ctx.fillStyle = '#0F172A';
    ctx.font = `bold ${Math.round(18 * scale)}px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(state.config.name || 'Sunseekers Express', targetWidth / 2, currentY + (18 * scale));

    ctx.fillStyle = '#475569';
    ctx.font = `${Math.round(13 * scale)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText(state.config.subtitle || '', targetWidth / 2, currentY + (36 * scale));

    return canvas;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9_\-\s]/gi, '').trim().replace(/\s+/g, '_') || 'Sunseekers_QR';
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // --------------------------------------------------------------------------
  // BATCH MULTI-GENERATOR
  // --------------------------------------------------------------------------
  function setupBatchGenerator() {
    elements.btnAddBatchRow.addEventListener('click', () => {
      state.batchItems.push({
        name: `Sunseekers Route #${state.batchItems.length + 1}`,
        url: 'https://sunseekers.co.za',
        category: 'Fleet & Buses'
      });
      renderBatchRows();
    });

    elements.btnLoadBatchTemplate.addEventListener('click', () => {
      state.batchItems = JSON.parse(JSON.stringify(DEFAULT_FLEET_BATCH));
      renderBatchRows();
      showToast('Loaded Sunseekers Fleet sample queue', 'info');
    });

    elements.btnClearBatchRows.addEventListener('click', () => {
      state.batchItems = [];
      renderBatchRows();
    });

    elements.btnGenerateAllBatch.addEventListener('click', executeBatchGeneration);
    elements.btnDownloadBatchZip.addEventListener('click', handleDownloadBatchZip);
    elements.btnSaveBatchToLibrary.addEventListener('click', handleSaveBatchToLibrary);
  }

  function renderBatchRows() {
    elements.batchTableBody.innerHTML = '';
    elements.batchRowCountLabel.textContent = `${state.batchItems.length} Codes in Queue`;
    elements.batchBadgeCount.textContent = state.batchItems.length;

    state.batchItems.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-subtle); font-size: 0.8rem;">${index + 1}</td>
        <td>
          <input type="text" class="table-input batch-name-input" value="${escapeHtml(item.name)}" placeholder="QR Code Name">
        </td>
        <td>
          <input type="text" class="table-input batch-url-input" value="${escapeHtml(item.url)}" placeholder="https://...">
        </td>
        <td>
          <select class="table-input batch-cat-select">
            ${(state.categories && state.categories.length ? state.categories : DEFAULT_CATEGORIES).map(cat => `
              <option value="${escapeHtml(cat)}" ${item.category === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>
            `).join('')}
          </select>
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-icon-danger btn-delete-row" data-index="${index}" title="Remove Row">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </td>
      `;

      // Live updates to batch state
      const nameInput = tr.querySelector('.batch-name-input');
      const urlInput = tr.querySelector('.batch-url-input');
      const catSelect = tr.querySelector('.batch-cat-select');
      const delBtn = tr.querySelector('.btn-delete-row');

      nameInput.addEventListener('input', (e) => { state.batchItems[index].name = e.target.value; });
      urlInput.addEventListener('input', (e) => { state.batchItems[index].url = e.target.value; });
      catSelect.addEventListener('change', (e) => { state.batchItems[index].category = e.target.value; });
      delBtn.addEventListener('click', () => {
        state.batchItems.splice(index, 1);
        renderBatchRows();
      });

      elements.batchTableBody.appendChild(tr);
    });
  }

  async function executeBatchGeneration() {
    if (!state.batchItems.length) {
      showToast('Queue is empty. Add rows or load sample first.', 'info');
      return;
    }

    elements.btnGenerateAllBatch.disabled = true;
    elements.btnGenerateAllBatch.innerHTML = 'Rendering...';
    elements.batchResultsSection.style.display = 'block';
    elements.batchPreviewGrid.innerHTML = '';
    state.batchGeneratedQrs = [];

    const baseOptions = buildQROptions(200);

    for (let i = 0; i < state.batchItems.length; i++) {
      const item = state.batchItems[i];
      const itemOptions = {
        ...baseOptions,
        data: item.url
      };

      const qrInstance = new window.QRCodeStyling(itemOptions);

      // Create preview card
      const card = document.createElement('div');
      card.className = 'batch-item-card';
      card.innerHTML = `
        <div class="batch-item-canvas" id="batchCanvas_${i}"></div>
        <div class="batch-item-title">${escapeHtml(item.name)}</div>
        <div class="batch-item-link" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</div>
        <button type="button" class="btn btn-secondary btn-xs btn-dl-batch-single" data-index="${i}">
          Download PNG
        </button>
      `;

      elements.batchPreviewGrid.appendChild(card);
      const canvasContainer = card.querySelector(`#batchCanvas_${i}`);
      qrInstance.append(canvasContainer);

      state.batchGeneratedQrs.push({
        item: item,
        qrInstance: qrInstance
      });
    }

    // Attach single download listeners
    document.querySelectorAll('.btn-dl-batch-single').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.index, 10);
        const entry = state.batchGeneratedQrs[idx];
        if (entry) {
          const dlOptions = {
            ...buildQROptions(1200),
            data: entry.item.url
          };
          const dlQR = new window.QRCodeStyling(dlOptions);
          await dlQR.download({ name: sanitizeFilename(entry.item.name), extension: 'png' });
        }
      });
    });

    elements.batchResultsCount.textContent = state.batchItems.length;
    elements.btnGenerateAllBatch.disabled = false;
    elements.btnGenerateAllBatch.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      <span>Generate All QR Codes</span>
    `;

    showToast(`Successfully generated ${state.batchItems.length} QR codes!`, 'success');
  }

  async function handleDownloadBatchZip() {
    if (!state.batchGeneratedQrs.length) {
      showToast('Please generate the QR codes first.', 'info');
      return;
    }

    if (typeof window.JSZip === 'undefined') {
      showToast('ZIP library not loaded.', 'danger');
      return;
    }

    try {
      showToast('Packaging ZIP archive... please wait', 'info');
      const zip = new window.JSZip();
      const folder = zip.folder('Sunseekers-QR-Codes');

      for (let i = 0; i < state.batchGeneratedQrs.length; i++) {
        const entry = state.batchGeneratedQrs[i];
        const dlOptions = {
          ...buildQROptions(1200),
          data: entry.item.url
        };
        const tempQR = new window.QRCodeStyling(dlOptions);
        const rawBlob = await tempQR.getRawData('png');
        const filename = `${String(i + 1).padStart(2, '0')}_${sanitizeFilename(entry.item.name)}.png`;
        folder.file(filename, rawBlob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'Sunseekers_Batch_QR_Codes.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      showToast('ZIP archive downloaded successfully!', 'success');
    } catch (err) {
      console.error('Batch ZIP download error:', err);
      showToast('Failed to create ZIP: ' + err.message, 'danger');
    }
  }

  function handleSaveBatchToLibrary() {
    if (!state.batchGeneratedQrs.length) {
      showToast('Please generate the batch first.', 'info');
      return;
    }

    let addedCount = 0;
    state.batchGeneratedQrs.forEach((entry) => {
      const id = 'sun_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const item = {
        id: id,
        name: entry.item.name,
        category: entry.item.category || 'Fleet & Buses',
        url: entry.item.url,
        subtitle: 'Scan for direct access',
        createdAt: new Date().toISOString(),
        configSnapshot: JSON.parse(JSON.stringify(state.config))
      };
      state.library.unshift(item);
      syncSingleQRCodeToSupabase(item);
      addedCount++;
    });

    saveLibraryToStorage();
    showToast(`Added ${addedCount} QR codes to Sunseekers Library!`, 'success');
    updateBadges();
  }

  // --------------------------------------------------------------------------
  // SAVED LIBRARY MANAGER
  // --------------------------------------------------------------------------
  function setupLibraryManager() {
    elements.librarySearchInput.addEventListener('input', renderLibrary);
    elements.btnPrintAllCards.addEventListener('click', () => openPrintModal('all'));
    elements.btnExportLibraryJson.addEventListener('click', handleExportLibraryJson);
  }

  function loadLibraryFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state.library = JSON.parse(saved);
      } else {
        // Pre-populate with starter Sunseekers items
        state.library = [
          {
            id: 'sun_init_1',
            name: 'Sunseekers Express - Ticket Booking',
            category: 'Tickets & Booking',
            url: 'https://sunseekers.co.za/book-tickets',
            subtitle: 'Direct online seat reservation & check-in',
            createdAt: new Date().toISOString(),
            configSnapshot: JSON.parse(JSON.stringify(state.config))
          },
          {
            id: 'sun_init_2',
            name: 'Fleet Luxury Coach #101 - Wi-Fi',
            category: 'Passenger Wi-Fi',
            url: 'WIFI:T:WPA;S:Sunseekers-Fleet-101;P:SeekTheSun2026;;',
            subtitle: 'Connect to free onboard high-speed Wi-Fi',
            createdAt: new Date().toISOString(),
            configSnapshot: { ...state.config, primaryColor: '#0284C7', secondaryColor: '#0369A1' }
          },
          {
            id: 'sun_init_3',
            name: 'Sunseekers Passenger Care Desk',
            category: 'Customer Feedback',
            url: 'https://wa.me/27821234567?text=Hello%20Sunseekers',
            subtitle: 'WhatsApp 24/7 passenger assistance & dispatch',
            createdAt: new Date().toISOString(),
            configSnapshot: { ...state.config, primaryColor: '#059669', secondaryColor: '#064E3B' }
          }
        ];
        saveLibraryToStorage();
      }
    } catch (err) {
      console.warn('Error accessing localStorage:', err);
      state.library = [];
    }
    updateBadges();
  }

  function saveLibraryToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.library));
    } catch (err) {
      console.warn('Error saving to localStorage:', err);
    }
    updateBadges();
  }

  function updateBadges() {
    elements.libraryCountBadge.textContent = state.library.length;
    elements.countAll.textContent = state.library.length;
  }

  function handleSaveStudioToLibrary() {
    computeDataString();
    const id = 'sun_' + Date.now();
    const item = {
      id: id,
      name: state.config.name || 'Sunseekers QR',
      category: state.config.category || 'Fleet & Buses',
      url: state.config.computedData,
      subtitle: state.config.subtitle,
      createdAt: new Date().toISOString(),
      configSnapshot: JSON.parse(JSON.stringify(state.config))
    };

    state.library.unshift(item);
    saveLibraryToStorage();
    syncSingleQRCodeToSupabase(item);
    showToast(`Saved "${item.name}" to Sunseekers Library!`, 'success');
  }

  function renderLibrary() {
    const searchTerm = (elements.librarySearchInput.value || '').toLowerCase().trim();
    const activeFilterChip = elements.libraryFilterChips.querySelector('.filter-chip.active');
    const categoryFilter = activeFilterChip ? activeFilterChip.dataset.filter : 'all';

    const filtered = state.library.filter(item => {
      const matchesSearch = !searchTerm ||
        item.name.toLowerCase().includes(searchTerm) ||
        (item.url && item.url.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm));

      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });

    elements.libraryGrid.innerHTML = '';

    if (!filtered.length) {
      elements.libraryEmptyState.style.display = 'flex';
      return;
    } else {
      elements.libraryEmptyState.style.display = 'none';
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'library-card';
      const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      card.innerHTML = `
        <div class="library-card-top">
          <span class="library-tag">${escapeHtml(item.category)}</span>
          <span class="library-date">${formattedDate}</span>
        </div>
        <div class="library-thumb-wrap" id="libThumb_${item.id}"></div>
        <div class="library-card-info">
          <h4 class="library-card-name">${escapeHtml(item.name)}</h4>
          <p class="library-card-link" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</p>
        </div>
        <div class="library-card-actions">
          <button type="button" class="btn btn-secondary btn-xs btn-lib-edit" data-id="${item.id}">
            Load in Studio
          </button>
          <button type="button" class="btn btn-primary btn-xs btn-lib-dl" data-id="${item.id}">
            Download
          </button>
          <button type="button" class="btn-icon-danger btn-lib-del" data-id="${item.id}" title="Delete">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;

      elements.libraryGrid.appendChild(card);

      // Render thumbnail QR
      const thumbContainer = card.querySelector(`#libThumb_${item.id}`);
      const thumbOptions = {
        ...buildQROptions(180),
        data: item.url,
        ...(item.configSnapshot ? buildOptionsFromSnapshot(item.configSnapshot, 180) : {})
      };
      const thumbQR = new window.QRCodeStyling(thumbOptions);
      thumbQR.append(thumbContainer);

      // Action Listeners
      card.querySelector('.btn-lib-edit').addEventListener('click', () => {
        loadItemIntoStudio(item);
      });

      card.querySelector('.btn-lib-dl').addEventListener('click', async () => {
        const dlOptions = {
          ...buildQROptions(1200),
          data: item.url,
          ...(item.configSnapshot ? buildOptionsFromSnapshot(item.configSnapshot, 1200) : {})
        };
        const dlQR = new window.QRCodeStyling(dlOptions);
        await dlQR.download({ name: sanitizeFilename(item.name), extension: 'png' });
        showToast(`Downloaded ${item.name}.png`, 'success');
      });

      card.querySelector('.btn-lib-del').addEventListener('click', () => {
        deleteSingleQRCodeFromSupabase(item.id);
        state.library = state.library.filter(libItem => libItem.id !== item.id);
        saveLibraryToStorage();
        renderLibrary();
        showToast(`Removed "${item.name}" from Library`, 'info');
      });
    });
  }

  function buildOptionsFromSnapshot(snap, size = 300) {
    const dotsOptions = {
      type: snap.dotsType || 'rounded',
      roundSize: true
    };
    if (snap.colorMode === 'solid') {
      dotsOptions.color = snap.primaryColor;
    } else if (snap.colorMode === 'linear') {
      dotsOptions.gradient = {
        type: 'linear',
        rotation: ((snap.gradientAngle || 45) * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: snap.primaryColor },
          { offset: 1, color: snap.secondaryColor }
        ]
      };
    } else {
      dotsOptions.gradient = {
        type: 'radial',
        colorStops: [
          { offset: 0, color: snap.primaryColor },
          { offset: 1, color: snap.secondaryColor }
        ]
      };
    }

    return {
      width: size,
      height: size,
      dotsOptions: dotsOptions,
      cornersSquareOptions: {
        type: snap.cornersSquareType || 'extra-rounded',
        color: snap.customEyeColors ? snap.eyeFrameColor : snap.primaryColor
      },
      cornersDotOptions: {
        type: snap.cornersDotType || 'dot',
        color: snap.customEyeColors ? snap.eyeDotColor : snap.primaryColor
      },
      image: snap.logoSrc || undefined,
      imageOptions: {
        hideBackgroundDots: snap.hideBackgroundDots !== false,
        imageSize: snap.logoSize || 0.30,
        margin: snap.logoMargin || 3,
        crossOrigin: 'anonymous'
      }
    };
  }

  function loadItemIntoStudio(item) {
    if (item.configSnapshot) {
      Object.assign(state.config, item.configSnapshot);
    }
    if (item.category && !state.categories.includes(item.category)) {
      state.categories.push(item.category);
      saveCategoriesToStorage();
      renderCategoryDropdowns();
    }

    state.config.name = item.name;
    state.config.category = item.category;
    state.config.subtitle = item.subtitle;
    state.config.rawUrl = item.url;
    state.config.computedData = item.url;

    // Synchronize UI Inputs
    elements.qrNameInput.value = item.name;
    elements.qrCategorySelect.value = item.category;
    elements.qrSubtitleInput.value = item.subtitle || '';
    elements.qrUrlInput.value = item.url;
    elements.primaryColor.value = state.config.primaryColor;
    elements.primaryHex.textContent = state.config.primaryColor;
    elements.secondaryColor.value = state.config.secondaryColor;
    elements.secondaryHex.textContent = state.config.secondaryColor;

    if (item.configSnapshot && item.configSnapshot.type) {
      switchDataType(item.configSnapshot.type);
      if (elements.customTypeInput && item.url) {
        const typeObj = state.dataTypes.find(t => t.id === item.configSnapshot.type);
        if (typeObj && typeObj.prefix && item.url.startsWith(typeObj.prefix)) {
          elements.customTypeInput.value = item.url.substring(typeObj.prefix.length);
        } else {
          elements.customTypeInput.value = item.url;
        }
      }
    } else {
      switchDataType('url');
    }

    // Switch to Studio tab
    elements.tabBtnStudio.click();
    requestQRUpdate();
    showToast(`Loaded "${item.name}" into Studio Creator`, 'success');
  }

  function handleExportLibraryJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.library, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `Sunseekers_QR_Library_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Library backup JSON downloaded!', 'success');
  }

  // --------------------------------------------------------------------------
  // PRINT MODAL & STAND CARD GENERATOR
  // --------------------------------------------------------------------------
  function setupPrintModal() {
    elements.btnClosePrintModal.addEventListener('click', () => {
      elements.printModalBackdrop.style.display = 'none';
    });

    elements.printModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.printModalBackdrop) {
        elements.printModalBackdrop.style.display = 'none';
      }
    });

    elements.btnExecuteBrowserPrint.addEventListener('click', () => {
      window.print();
    });

    elements.printCardLayoutSelect.addEventListener('change', () => {
      renderPrintableSheet();
    });
  }

  let printModalItems = [];

  function openPrintModal(source = 'all') {
    if (source === 'studio') {
      printModalItems = [{
        name: state.config.name,
        category: state.config.category,
        url: state.config.computedData,
        subtitle: state.config.subtitle,
        configSnapshot: JSON.parse(JSON.stringify(state.config))
      }];
    } else {
      printModalItems = state.library.length ? state.library : [{
        name: state.config.name,
        category: state.config.category,
        url: state.config.computedData,
        subtitle: state.config.subtitle,
        configSnapshot: JSON.parse(JSON.stringify(state.config))
      }];
    }

    elements.printModalBackdrop.style.display = 'flex';
    renderPrintableSheet();
  }

  function renderPrintableSheet() {
    const layout = elements.printCardLayoutSelect.value;
    elements.printableSheetContainer.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'print-sheet-page';

    if (layout === 'stand') {
      // 2 Foldable Table / Counter Stand Cards
      const grid = document.createElement('div');
      grid.className = 'print-stand-grid';

      printModalItems.slice(0, 4).forEach((item, idx) => {
        const stand = document.createElement('div');
        stand.className = 'print-stand-item';
        stand.innerHTML = `
          <div class="print-stand-brand">
            <img src="assets/sunseekers-logo.svg" alt="Sunseekers" class="print-stand-logo">
            <span class="print-stand-company">SUNSEEKERS TRAVEL</span>
          </div>
          <div class="print-stand-qr" id="printStandQr_${idx}"></div>
          <h4 class="print-stand-title">${escapeHtml(item.name)}</h4>
          <p class="print-stand-sub">${escapeHtml(item.subtitle || 'Point camera to view & book')}</p>
          <div class="print-stand-cut">✂ FOLD ALONG LINE FOR COUNTER / SEAT STAND</div>
        `;
        grid.appendChild(stand);

        setTimeout(() => {
          const qrContainer = stand.querySelector(`#printStandQr_${idx}`);
          if (qrContainer) {
            const qr = new window.QRCodeStyling({
              ...buildQROptions(170),
              data: item.url,
              ...(item.configSnapshot ? buildOptionsFromSnapshot(item.configSnapshot, 170) : {})
            });
            qr.append(qrContainer);
          }
        }, 30);
      });

      page.appendChild(grid);
    } else if (layout === 'sticker') {
      // 4 Compact Window / Seat Stickers
      const grid = document.createElement('div');
      grid.className = 'print-sticker-grid';

      printModalItems.slice(0, 6).forEach((item, idx) => {
        const sticker = document.createElement('div');
        sticker.className = 'print-sticker-item';
        sticker.innerHTML = `
          <div class="print-sticker-qr" id="printStickerQr_${idx}"></div>
          <div>
            <div style="font-size: 0.72rem; font-weight: 800; color: #D84315; letter-spacing: 0.05em; text-transform: uppercase;">
              Sunseekers Fleet
            </div>
            <h4 style="font-family: Outfit; font-size: 0.95rem; font-weight: 800; color: #0F172A; margin: 2px 0;">
              ${escapeHtml(item.name)}
            </h4>
            <p style="font-size: 0.74rem; color: #475569;">${escapeHtml(item.subtitle || 'Scan to view details')}</p>
          </div>
        `;
        grid.appendChild(sticker);

        setTimeout(() => {
          const qrContainer = sticker.querySelector(`#printStickerQr_${idx}`);
          if (qrContainer) {
            const qr = new window.QRCodeStyling({
              ...buildQROptions(110),
              data: item.url,
              ...(item.configSnapshot ? buildOptionsFromSnapshot(item.configSnapshot, 110) : {})
            });
            qr.append(qrContainer);
          }
        }, 30);
      });

      page.appendChild(grid);
    } else {
      // Single Display Board
      const item = printModalItems[0] || { name: 'Sunseekers Express', url: 'https://sunseekers.co.za' };
      page.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px;">
            <img src="assets/sunseekers-logo.svg" style="width: 48px; height: 48px;" alt="Logo">
            <h2 style="font-family: Outfit; font-size: 1.8rem; font-weight: 800; color: #D84315; letter-spacing: 0.05em;">
              SUNSEEKERS
            </h2>
          </div>
          <div id="printSingleQr" style="width: 320px; height: 320px; margin: 0 auto 24px; padding: 12px; border: 2px solid #E2E8F0; border-radius: 16px;"></div>
          <h3 style="font-family: Outfit; font-size: 1.6rem; font-weight: 800; color: #0F172A; margin-bottom: 8px;">
            ${escapeHtml(item.name)}
          </h3>
          <p style="font-size: 1.1rem; color: #475569; margin-bottom: 12px;">${escapeHtml(item.subtitle || 'Scan with your smartphone camera to connect')}</p>
          <p style="font-size: 0.85rem; color: #94A3B8; font-family: monospace;">${escapeHtml(item.url)}</p>
        </div>
      `;

      setTimeout(() => {
        const qrContainer = page.querySelector('#printSingleQr');
        if (qrContainer) {
          const qr = new window.QRCodeStyling({
            ...buildQROptions(300),
            data: item.url,
            ...(item.configSnapshot ? buildOptionsFromSnapshot(item.configSnapshot, 300) : {})
          });
          qr.append(qrContainer);
        }
      }, 30);
    }

    elements.printableSheetContainer.appendChild(page);
  }

  // --------------------------------------------------------------------------
  // RUN APPLICATION
  // --------------------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
