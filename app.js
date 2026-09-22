/**
 * SUNSEEKERS QR CODE GENERATOR
 * Core Studio Controller, Supabase Cloud Persistence & Library Manager
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // CONSTANTS & STARTER DATA
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'sunseekers_qr_library_v2';
  const CATEGORIES_STORAGE_KEY = 'sunseekers_categories_v1';
  const TYPES_STORAGE_KEY = 'sunseekers_datatypes_v1';
  const SUPABASE_STORAGE_KEY = 'sunseekers_supabase_v1';
  const TOMBSTONES_STORAGE_KEY = 'sunseekers_qr_tombstones_v2';

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
    library: [],
    // Currently active working QR code ID
    currentWorkingId: null
  };

  let qrCodeInstance = null;
  let updateDebounceTimeout = null;
  let autoPersistTimeout = null;

  // --------------------------------------------------------------------------
  // DOM REFERENCES
  // --------------------------------------------------------------------------
  const elements = {
    // Navigation Tabs
    tabBtnStudio: document.getElementById('tabBtnStudio'),
    tabBtnLibrary: document.getElementById('tabBtnLibrary'),
    viewStudio: document.getElementById('viewStudio'),
    viewLibrary: document.getElementById('viewLibrary'),
    libraryCountBadge: document.getElementById('libraryCountBadge'),
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

    // Supabase Cloud Sync UI
    btnSupabaseSync: document.getElementById('btnSupabaseSync'),
    cloudStatusDot: document.getElementById('cloudStatusDot'),
    cloudStatusLabel: document.getElementById('cloudStatusLabel'),
    supabaseModalBackdrop: document.getElementById('supabaseModalBackdrop'),
    btnCloseSupabaseModal: document.getElementById('btnCloseSupabaseModal'),
    btnDoneSupabaseModal: document.getElementById('btnDoneSupabaseModal'),
    modalStatusOrb: document.getElementById('modalStatusOrb'),
    modalStatusTitle: document.getElementById('modalStatusTitle'),
    modalStatusDesc: document.getElementById('modalStatusDesc'),
    modalSchemaAlert: document.getElementById('modalSchemaAlert'),
    btnModalCopySql: document.getElementById('btnModalCopySql'),
    supabaseUrlInput: document.getElementById('supabaseUrlInput'),
    supabaseKeyInput: document.getElementById('supabaseKeyInput'),
    btnTestSupabaseConn: document.getElementById('btnTestSupabaseConn'),
    btnSaveSupabaseConfig: document.getElementById('btnSaveSupabaseConfig'),
    btnCopySqlSchema: document.getElementById('btnCopySqlSchema'),
    btnManualSyncNow: document.getElementById('btnManualSyncNow')
  };

  function getApiBaseUrl() {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:3005';
    }
    return '';
  }

  // --------------------------------------------------------------------------
  // GLOBAL SERVER PERSISTENCE & SYNC (Multi-User Cross-Device)
  // --------------------------------------------------------------------------
  async function fetchGlobalServerData() {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/library`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      let changed = false;

      // 1. Reconcile Library
      if (Array.isArray(data.library)) {
        const serverMap = new Map();
        data.library.forEach(item => serverMap.set(item.id, item));

        const nextLibrary = [];
        for (const localItem of state.library) {
          if (deletedTombstones.has(localItem.id)) {
            if (serverMap.has(localItem.id)) {
              deleteFromServer(localItem.id);
            }
            changed = true;
            continue;
          }

          if (serverMap.has(localItem.id)) {
            const remote = serverMap.get(localItem.id);
            if (
              localItem.name !== remote.name ||
              localItem.category !== remote.category ||
              localItem.url !== remote.url ||
              localItem.subtitle !== (remote.subtitle || '') ||
              JSON.stringify(localItem.configSnapshot || {}) !== JSON.stringify(remote.configSnapshot || {})
            ) {
              Object.assign(localItem, remote);
              changed = true;
            }
            localItem._synced = true;
            nextLibrary.push(localItem);
          } else {
            if (localItem._synced) {
              changed = true;
            } else {
              saveToServer(localItem);
              nextLibrary.push(localItem);
            }
          }
        }

        const localIds = new Set(nextLibrary.map(i => i.id));
        for (const remote of data.library) {
          if (!localIds.has(remote.id) && !deletedTombstones.has(remote.id)) {
            remote._synced = true;
            nextLibrary.push(remote);
            changed = true;
          }
        }

        nextLibrary.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (changed || nextLibrary.length !== state.library.length) {
          state.library = nextLibrary;
          saveLibraryToStorage();
          renderLibrary();
        }
      }

      // 2. Reconcile Categories
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        const set1 = new Set(state.categories);
        const set2 = new Set(data.categories);
        if (set1.size !== set2.size || [...set1].some(c => !set2.has(c))) {
          state.categories = data.categories;
          saveCategoriesToStorage();
          renderCategoryDropdowns();
          renderCategoryManageList();
        }
      }

      // 3. Reconcile Data Types
      if (Array.isArray(data.dataTypes) && data.dataTypes.length > 0) {
        if (JSON.stringify(state.dataTypes) !== JSON.stringify(data.dataTypes)) {
          state.dataTypes = data.dataTypes;
          saveTypesToStorage();
          renderTypeDropdown();
          renderTypeManageList();
        }
      }
    } catch (err) {
      // Offline fallback
    }
  }

  async function saveToServer(item) {
    try {
      await fetch(`${getApiBaseUrl()}/api/library/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item })
      });
    } catch (e) {}
  }

  async function deleteFromServer(id) {
    try {
      await fetch(`${getApiBaseUrl()}/api/library/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {}
  }

  async function saveCategoryToServer(name) {
    try {
      await fetch(`${getApiBaseUrl()}/api/categories/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
    } catch (e) {}
  }

  async function deleteCategoryFromServer(name) {
    try {
      await fetch(`${getApiBaseUrl()}/api/categories/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
    } catch (e) {}
  }

  async function saveDataTypeToServer(typeObj) {
    try {
      await fetch(`${getApiBaseUrl()}/api/datatypes/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: typeObj })
      });
    } catch (e) {}
  }

  async function deleteDataTypeFromServer(id) {
    try {
      await fetch(`${getApiBaseUrl()}/api/datatypes/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  function init() {
    loadCategories();
    loadDataTypes();
    loadSupabaseConfig();
    loadTombstones();
    loadLibraryFromStorage();
    setupNavigation();
    setupStudioEventListeners();
    setupCategoryManagement();
    setupTypeManagement();
    setupSupabaseManagement();
    setupLibraryManager();
    setupPrintModal();

    renderCategoryDropdowns();
    renderTypeDropdown();

    // Initial QR Code Render
    computeDataString();
    initQRCodeInstance();
    renderLibrary();

    // Immediate initial sync with global server and Supabase
    fetchGlobalServerData();
    checkSupabaseHealth(false);

    // Fast 3-second background polling for multi-user instant updates across all data
    setInterval(() => {
      fetchGlobalServerData();
      if (state.supabase.connected && state.supabase.tablesReady) {
        fetchCloudCategories();
        fetchCloudDataTypes();
        fetchCloudQRCodes();
      } else {
        checkSupabaseHealth(false);
      }
    }, 3000);

    // Immediate sync when tab gains focus or visibility
    window.addEventListener('focus', () => {
      fetchGlobalServerData();
      if (state.supabase.connected && state.supabase.tablesReady) {
        fetchCloudCategories();
        fetchCloudDataTypes();
        fetchCloudQRCodes();
      } else {
        checkSupabaseHealth(false);
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        fetchGlobalServerData();
        if (state.supabase.connected && state.supabase.tablesReady) {
          fetchCloudCategories();
          fetchCloudDataTypes();
          fetchCloudQRCodes();
        } else {
          checkSupabaseHealth(false);
        }
      }
    });
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

    // Library Filter Chips
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
        deleteCategoryFromServer(removedCat);
        deleteCategoryFromSupabase(removedCat);
        renderCategoryDropdowns();
        renderCategoryManageList();
        showToast(`Deleted category "${removedCat}" globally`, 'info');
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
    saveCategoryToServer(val);
    syncCategoryToSupabase(val);
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
        deleteDataTypeFromServer(removed.id);
        deleteDataTypeFromSupabase(removed.id);
        renderTypeDropdown();
        renderTypeManageList();
        showToast(`Deleted data type "${removed.name}" globally`, 'info');
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
    saveDataTypeToServer(newType);
    syncDataTypeToSupabase(newType);
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
  // SUPABASE CLOUD SYNC & GLOBAL PERSISTENCE ENGINE
  // --------------------------------------------------------------------------
  let deletedTombstones = new Set();

  function loadTombstones() {
    try {
      const saved = localStorage.getItem(TOMBSTONES_STORAGE_KEY);
      if (saved) {
        deletedTombstones = new Set(JSON.parse(saved));
      }
    } catch (e) {
      deletedTombstones = new Set();
    }
  }

  function saveTombstones() {
    try {
      const arr = Array.from(deletedTombstones).slice(-200);
      localStorage.setItem(TOMBSTONES_STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

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
    if (elements.btnSupabaseSync) {
      elements.btnSupabaseSync.addEventListener('click', openSupabaseModal);
    }
    if (elements.btnCloseSupabaseModal) {
      elements.btnCloseSupabaseModal.addEventListener('click', closeSupabaseModal);
    }
    if (elements.btnDoneSupabaseModal) {
      elements.btnDoneSupabaseModal.addEventListener('click', closeSupabaseModal);
    }
    if (elements.supabaseModalBackdrop) {
      elements.supabaseModalBackdrop.addEventListener('click', (e) => {
        if (e.target === elements.supabaseModalBackdrop) closeSupabaseModal();
      });
    }

    if (elements.btnSaveSupabaseConfig) {
      elements.btnSaveSupabaseConfig.addEventListener('click', () => {
        let rawUrl = (elements.supabaseUrlInput ? elements.supabaseUrlInput.value : '').trim();
        rawUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
        const rawKey = (elements.supabaseKeyInput ? elements.supabaseKeyInput.value : '').trim();

        state.supabase.url = rawUrl || DEFAULT_SUPABASE_CONFIG.url;
        state.supabase.key = rawKey || DEFAULT_SUPABASE_CONFIG.key;
        saveSupabaseConfig();

        showToast('Saved Supabase configuration. Testing...', 'info');
        checkSupabaseHealth(true);
      });
    }

    if (elements.btnTestSupabaseConn) {
      elements.btnTestSupabaseConn.addEventListener('click', () => {
        checkSupabaseHealth(true);
      });
    }

    if (elements.btnCopySqlSchema) {
      elements.btnCopySqlSchema.addEventListener('click', copySqlSchemaToClipboard);
    }
    if (elements.btnModalCopySql) {
      elements.btnModalCopySql.addEventListener('click', copySqlSchemaToClipboard);
    }
    if (elements.btnManualSyncNow) {
      elements.btnManualSyncNow.addEventListener('click', () => syncAllWithCloud(true));
    }
  }

  function openSupabaseModal() {
    if (!elements.supabaseModalBackdrop) return;
    elements.supabaseModalBackdrop.style.display = 'flex';
    if (elements.supabaseUrlInput) elements.supabaseUrlInput.value = state.supabase.url;
    if (elements.supabaseKeyInput) elements.supabaseKeyInput.value = state.supabase.key;
    checkSupabaseHealth(false);
  }

  function closeSupabaseModal() {
    if (elements.supabaseModalBackdrop) {
      elements.supabaseModalBackdrop.style.display = 'none';
    }
  }

  async function copySqlSchemaToClipboard() {
    let sqlContent = '';
    try {
      const res = await fetch('/api/schema');
      if (res.ok) {
        sqlContent = await res.text();
      }
    } catch (e) {}

    if (!sqlContent) {
      sqlContent = `-- SUNSEEKERS QR CODE GENERATOR - SUPABASE SCHEMA SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.qr_codes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Fleet & Buses',
    url TEXT NOT NULL,
    subtitle TEXT,
    config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
CREATE POLICY "Allow anon all on qr_data_types" ON public.qr_data_types FOR ALL USING (true) WITH CHECK (true);
`;
    }

    try {
      await navigator.clipboard.writeText(sqlContent);
      showToast('SQL Setup Script copied to clipboard! Paste into Supabase SQL Editor and click Run.', 'success');
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = sqlContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('SQL Setup Script copied to clipboard!', 'success');
    }
  }

  async function checkSupabaseHealth(showToasts = false) {
    const url = state.supabase.url;
    const key = state.supabase.key;

    if (!url || !key) {
      state.supabase.connected = false;
      state.supabase.tablesReady = false;
      updateCloudStatus('disconnected', 'Disconnected', 'No Supabase credentials configured.');
      return;
    }

    try {
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
        updateCloudStatus('connected', 'Supabase Cloud Connected', 'Database tables verified & real-time sync active across all users.');
        if (showToasts) showToast('Connected to Supabase PostgreSQL cluster!', 'success');
        await syncAllWithCloud(false);
      } else if (res.status === 404) {
        state.supabase.connected = true;
        state.supabase.tablesReady = false;
        updateCloudStatus('pending', 'Schema Setup Required', 'Supabase project is online, but tables (qr_codes) are not created yet.');
        if (showToasts) showToast('Connected to Supabase! Run SQL Setup Script to create tables.', 'warning');
      } else {
        state.supabase.connected = false;
        state.supabase.tablesReady = false;
        updateCloudStatus('error', 'Auth/Network Error', `Supabase returned HTTP status ${res.status}.`);
        if (showToasts) showToast(`Supabase connection failed (${res.status})`, 'danger');
      }
    } catch (err) {
      state.supabase.connected = false;
      state.supabase.tablesReady = false;
      updateCloudStatus('error', 'Connection Error', 'Unable to reach Supabase. Operating in local storage mode.');
      if (showToasts) showToast('Could not reach Supabase: ' + err.message, 'danger');
    }
  }

  function updateCloudStatus(status, title, desc) {
    if (elements.cloudStatusDot) elements.cloudStatusDot.className = 'cloud-dot';
    if (elements.modalStatusOrb) elements.modalStatusOrb.className = 'status-orb';

    if (status === 'connected') {
      if (elements.cloudStatusDot) elements.cloudStatusDot.classList.add('connected');
      if (elements.modalStatusOrb) elements.modalStatusOrb.classList.add('connected');
      if (elements.cloudStatusLabel) elements.cloudStatusLabel.textContent = 'Cloud: Synced';

      if (elements.modalStatusTitle) elements.modalStatusTitle.textContent = title;
      if (elements.modalStatusDesc) elements.modalStatusDesc.textContent = desc;
      if (elements.modalSchemaAlert) elements.modalSchemaAlert.style.display = 'none';
    } else if (status === 'pending') {
      if (elements.cloudStatusDot) elements.cloudStatusDot.classList.add('warning');
      if (elements.modalStatusOrb) elements.modalStatusOrb.classList.add('warning');
      if (elements.cloudStatusLabel) elements.cloudStatusLabel.textContent = 'Supabase Cloud';

      if (elements.modalStatusTitle) elements.modalStatusTitle.textContent = title;
      if (elements.modalStatusDesc) elements.modalStatusDesc.textContent = desc;
      if (elements.modalSchemaAlert) elements.modalSchemaAlert.style.display = 'block';
    } else {
      if (elements.cloudStatusDot) elements.cloudStatusDot.classList.add('error');
      if (elements.modalStatusOrb) elements.modalStatusOrb.classList.add('error');
      if (elements.cloudStatusLabel) elements.cloudStatusLabel.textContent = 'Supabase Cloud';

      if (elements.modalStatusTitle) elements.modalStatusTitle.textContent = title;
      if (elements.modalStatusDesc) elements.modalStatusDesc.textContent = desc;
      if (elements.modalSchemaAlert) elements.modalSchemaAlert.style.display = 'none';
    }
  }

  // Master Synchronizer: Pulls and pushes QR codes, categories, and data types
  async function syncAllWithCloud(isManual = false) {
    if (!state.supabase.connected || !state.supabase.tablesReady) {
      if (isManual) {
        showToast('Supabase tables are not ready. Run the SQL setup script first.', 'warning');
      }
      return;
    }

    try {
      await Promise.all([
        fetchCloudCategories(),
        fetchCloudDataTypes(),
        fetchCloudQRCodes()
      ]);
      if (isManual) {
        showToast('Synchronized all data with Supabase Cloud!', 'success');
      }
    } catch (err) {
      console.warn('Background sync error:', err);
      if (isManual) {
        showToast('Sync error: ' + err.message, 'danger');
      }
    }
  }

  // --- 1. QR CODES CLOUD SYNC ---
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

      if (!res.ok) return;

      const cloudCodes = await res.json();
      if (!Array.isArray(cloudCodes)) return;

      const cloudMap = new Map();
      cloudCodes.forEach(c => cloudMap.set(c.id, c));

      let updated = false;

      // 1. RECONCILE LOCAL ITEMS AGAINST CLOUD:
      // If a local item was already synced (or in tombstones) and is now missing in cloud,
      // another user deleted it! Remove it locally so deletions are global across all clients.
      // If a local item has _synced === false (created offline), push it to Supabase now!
      const retainedLibrary = [];
      for (const localItem of state.library) {
        if (deletedTombstones.has(localItem.id)) {
          // Explicitly deleted by this user; ensure deleted on remote as well
          if (cloudMap.has(localItem.id)) {
            await deleteSingleQRCodeFromSupabase(localItem.id, false);
          }
          updated = true;
          continue; // Drop from library
        }

        if (cloudMap.has(localItem.id)) {
          const remote = cloudMap.get(localItem.id);
          const remoteUpdated = remote.updated_at || remote.created_at;

          // Check if remote data differs from local
          const localSnapStr = JSON.stringify(localItem.configSnapshot || {});
          const remoteSnapStr = JSON.stringify(remote.config_snapshot || {});

          if (
            localItem.name !== remote.name ||
            localItem.category !== remote.category ||
            localItem.url !== remote.url ||
            localItem.subtitle !== (remote.subtitle || '') ||
            localSnapStr !== remoteSnapStr
          ) {
            localItem.name = remote.name;
            localItem.category = remote.category || 'Fleet & Buses';
            localItem.url = remote.url;
            localItem.subtitle = remote.subtitle || '';
            localItem.configSnapshot = remote.config_snapshot || {};
            localItem.updatedAt = remoteUpdated;
            updated = true;

            // If active in studio, live-update studio controls and preview
            if (state.currentWorkingId === localItem.id) {
              loadItemIntoStudio(localItem);
            }
          }
          localItem._synced = true;
          retainedLibrary.push(localItem);
        } else {
          // Item missing in Supabase
          if (localItem._synced) {
            // Previously synced, now gone -> Deleted by another user or session!
            updated = true;
            // Drop it so deletion reflects across all users!
          } else {
            // Created while offline, push it to Supabase now!
            await syncSingleQRCodeToSupabase(localItem);
            retainedLibrary.push(localItem);
          }
        }
      }

      // 2. ADD NEW ITEMS CREATED BY OTHER USERS:
      const currentLocalIds = new Set(retainedLibrary.map(i => i.id));
      for (const remote of cloudCodes) {
        if (!currentLocalIds.has(remote.id) && !deletedTombstones.has(remote.id)) {
          retainedLibrary.push({
            id: remote.id,
            name: remote.name,
            category: remote.category || 'Fleet & Buses',
            url: remote.url,
            subtitle: remote.subtitle || '',
            createdAt: remote.created_at,
            updatedAt: remote.updated_at || remote.created_at,
            configSnapshot: remote.config_snapshot || {},
            _synced: true
          });
          updated = true;
        }
      }

      // Keep newest first
      retainedLibrary.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      if (updated || retainedLibrary.length !== state.library.length) {
        state.library = retainedLibrary;
        saveLibraryToStorage();
        renderLibrary();
      }
    } catch (e) {
      console.warn('Error fetching cloud codes:', e);
    }
  }

  async function syncSingleQRCodeToSupabase(item) {
    if (!state.supabase.connected || !state.supabase.tablesReady) return false;
    try {
      const payload = {
        id: item.id,
        name: item.name,
        category: item.category || 'Fleet & Buses',
        url: item.url,
        subtitle: item.subtitle || '',
        config_snapshot: item.configSnapshot || {},
        created_at: item.createdAt || new Date().toISOString(),
        updated_at: item.updatedAt || new Date().toISOString()
      };

      const res = await fetch(`${state.supabase.url}/rest/v1/qr_codes`, {
        method: 'POST',
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        item._synced = true;
        if (deletedTombstones.has(item.id)) {
          deletedTombstones.delete(item.id);
          saveTombstones();
        }
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Cloud sync error for QR code:', e);
      return false;
    }
  }

  async function deleteSingleQRCodeFromSupabase(id, recordTombstone = true) {
    if (recordTombstone) {
      deletedTombstones.add(id);
      saveTombstones();
    }
    if (!state.supabase.connected || !state.supabase.tablesReady) return false;
    try {
      const res = await fetch(`${state.supabase.url}/rest/v1/qr_codes?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`
        }
      });
      return res.ok;
    } catch (e) {
      console.warn('Cloud delete error for QR code:', e);
      return false;
    }
  }

  // --- 2. CATEGORIES CLOUD SYNC ---
  async function fetchCloudCategories() {
    if (!state.supabase.connected || !state.supabase.tablesReady) return;
    try {
      const url = `${state.supabase.url}/rest/v1/qr_categories?select=*&order=id.asc`;
      const res = await fetch(url, {
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`
        }
      });

      if (res.ok) {
        const cloudCats = await res.json();
        if (Array.isArray(cloudCats) && cloudCats.length > 0) {
          const names = cloudCats.map(c => (c.name || '').trim()).filter(Boolean);
          const isDifferent = names.length !== state.categories.length ||
            names.some((n, idx) => n !== state.categories[idx]);
          if (isDifferent) {
            state.categories = names;
            saveCategoriesToStorage();
            renderCategoryDropdowns();
            renderCategoryManageList();
          }
        } else if (Array.isArray(cloudCats) && cloudCats.length === 0) {
          for (const cat of state.categories) {
            await syncCategoryToSupabase(cat);
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching cloud categories:', e);
    }
  }

  async function syncCategoryToSupabase(catName) {
    if (!state.supabase.connected || !state.supabase.tablesReady || !catName) return;
    try {
      await fetch(`${state.supabase.url}/rest/v1/qr_categories`, {
        method: 'POST',
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify({ name: catName.trim() })
      });
    } catch (e) {
      console.warn('Cloud sync error for category:', e);
    }
  }

  async function deleteCategoryFromSupabase(catName) {
    if (!state.supabase.connected || !state.supabase.tablesReady || !catName) return;
    try {
      await fetch(`${state.supabase.url}/rest/v1/qr_categories?name=eq.${encodeURIComponent(catName.trim())}`, {
        method: 'DELETE',
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`
        }
      });
    } catch (e) {
      console.warn('Cloud delete error for category:', e);
    }
  }

  // --- 3. DATA TYPES CLOUD SYNC ---
  async function fetchCloudDataTypes() {
    if (!state.supabase.connected || !state.supabase.tablesReady) return;
    try {
      const url = `${state.supabase.url}/rest/v1/qr_data_types?select=*&order=created_at.asc`;
      const res = await fetch(url, {
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`
        }
      });

      if (res.ok) {
        const cloudTypes = await res.json();
        if (Array.isArray(cloudTypes) && cloudTypes.length > 0) {
          const remoteMapped = cloudTypes.map(ct => ({
            id: ct.id,
            name: ct.name,
            prefix: ct.prefix || '',
            placeholder: ct.placeholder || '',
            hint: ct.hint || '',
            isBuiltin: !!ct.is_builtin
          }));

          const isDifferent = JSON.stringify(remoteMapped) !== JSON.stringify(state.dataTypes);
          if (isDifferent) {
            state.dataTypes = remoteMapped;
            saveTypesToStorage();
            renderTypeDropdown();
            renderTypeManageList();
          }
        } else if (Array.isArray(cloudTypes) && cloudTypes.length === 0) {
          for (const dt of state.dataTypes) {
            await syncDataTypeToSupabase(dt);
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching cloud data types:', e);
    }
  }

  async function syncDataTypeToSupabase(typeObj) {
    if (!state.supabase.connected || !state.supabase.tablesReady || !typeObj) return;
    try {
      const payload = {
        id: typeObj.id,
        name: typeObj.name,
        prefix: typeObj.prefix || '',
        placeholder: typeObj.placeholder || '',
        hint: typeObj.hint || '',
        is_builtin: !!typeObj.isBuiltin
      };

      await fetch(`${state.supabase.url}/rest/v1/qr_data_types`, {
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
      console.warn('Cloud sync error for data type:', e);
    }
  }

  async function deleteDataTypeFromSupabase(typeId) {
    if (!state.supabase.connected || !state.supabase.tablesReady || !typeId) return;
    try {
      await fetch(`${state.supabase.url}/rest/v1/qr_data_types?id=eq.${encodeURIComponent(typeId)}`, {
        method: 'DELETE',
        headers: {
          'apikey': state.supabase.key,
          'Authorization': `Bearer ${state.supabase.key}`
        }
      });
    } catch (e) {
      console.warn('Cloud delete error for data type:', e);
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

      // Automatically background-persist changes after gentle debounce
      scheduleAutoPersist();
    }, 60);
  }

  function scheduleAutoPersist() {
    if (autoPersistTimeout) clearTimeout(autoPersistTimeout);
    autoPersistTimeout = setTimeout(() => {
      if (state.config.name && state.config.computedData) {
        persistCurrentQRCode({ showToastNotification: false });
      }
    }, 1500);
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
      scheduleAutoPersist();
    });

    elements.qrSubtitleInput.addEventListener('input', (e) => {
      state.config.subtitle = e.target.value.trim();
      updateLivePreviewText();
      scheduleAutoPersist();
    });

    elements.qrCategorySelect.addEventListener('change', (e) => {
      state.config.category = e.target.value;
      updateLivePreviewText();
      scheduleAutoPersist();
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
    elements.btnPrintCard.addEventListener('click', () => {
      persistCurrentQRCode({ showToastNotification: false });
      openPrintModal('studio');
    });
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
      persistCurrentQRCode({ showToastNotification: false });
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
      persistCurrentQRCode({ showToastNotification: false });
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
        state.library = [];
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

  function persistCurrentQRCode({ showToastNotification = false } = {}) {
    computeDataString();

    const name = (state.config.name || 'Sunseekers QR').trim();
    const url = state.config.computedData;
    const category = state.config.category || 'Fleet & Buses';
    const subtitle = state.config.subtitle || '';
    const configSnapshot = JSON.parse(JSON.stringify(state.config));

    // Try finding existing item by active working ID first, or by name + URL
    let existingItem = null;
    if (state.currentWorkingId) {
      existingItem = state.library.find(i => i.id === state.currentWorkingId);
    }
    if (!existingItem) {
      existingItem = state.library.find(i => i.name.toLowerCase() === name.toLowerCase() && i.url === url);
    }

    let item;
    if (existingItem) {
      existingItem.name = name;
      existingItem.url = url;
      existingItem.category = category;
      existingItem.subtitle = subtitle;
      existingItem.configSnapshot = configSnapshot;
      existingItem.updatedAt = new Date().toISOString();
      item = existingItem;
      state.currentWorkingId = item.id;
    } else {
      const id = 'sun_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      item = {
        id: id,
        name: name,
        category: category,
        url: url,
        subtitle: subtitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        configSnapshot: configSnapshot,
        _synced: false
      };
      state.library.unshift(item);
      state.currentWorkingId = id;
    }

    // Remove from deleted tombstones if it was previously deleted
    if (deletedTombstones.has(item.id)) {
      deletedTombstones.delete(item.id);
      saveTombstones();
    }

    saveLibraryToStorage();
    renderLibrary();

    // 1. Save to Global Server Database (instant multi-user sync)
    saveToServer(item);

    // 2. Sync to Supabase Cloud
    if (state.supabase.connected && state.supabase.tablesReady) {
      syncSingleQRCodeToSupabase(item).then(success => {
        if (showToastNotification) {
          showToast(`Saved "${item.name}" globally!`, 'success');
        }
      });
    } else {
      if (showToastNotification) {
        showToast(`Saved "${item.name}" globally!`, 'success');
      }
    }

    return item;
  }

  function handleSaveStudioToLibrary() {
    persistCurrentQRCode({ showToastNotification: true });
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
          <button type="button" class="btn-icon-danger btn-lib-del" data-id="${item.id}" title="Permanently Delete">
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

      card.querySelector('.btn-lib-del').addEventListener('click', async () => {
        const confirmed = window.confirm(`Permanently delete "${item.name}"?\nThis will remove it globally across all users and devices.`);
        if (!confirmed) return;

        // Register tombstone so this client never re-uploads it
        deletedTombstones.add(item.id);
        saveTombstones();

        state.library = state.library.filter(libItem => libItem.id !== item.id);
        if (state.currentWorkingId === item.id) {
          state.currentWorkingId = null;
        }
        saveLibraryToStorage();
        renderLibrary();

        // Delete from global server and Supabase
        deleteFromServer(item.id);
        deleteSingleQRCodeFromSupabase(item.id, true);

        showToast(`Permanently deleted "${item.name}" globally`, 'info');
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
    state.currentWorkingId = item.id;

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
    state.config.subtitle = item.subtitle || '';
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

    // Sync shapes
    if (elements.dotTypeSelector) {
      elements.dotTypeSelector.querySelectorAll('.shape-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === state.config.dotsType);
      });
    }
    if (elements.cornerSquareSelect) elements.cornerSquareSelect.value = state.config.cornersSquareType;
    if (elements.cornerDotSelect) elements.cornerDotSelect.value = state.config.cornersDotType;

    // Sync Frame
    if (elements.frameStyleSelect) elements.frameStyleSelect.value = state.config.frameStyle;
    if (elements.frameTextInput) elements.frameTextInput.value = state.config.frameText || '';
    if (elements.frameBgColor) {
      elements.frameBgColor.value = state.config.frameBgColor;
      elements.frameBgHex.textContent = state.config.frameBgColor;
    }
    if (elements.frameTextColor) {
      elements.frameTextColor.value = state.config.frameTextColor;
      elements.frameTextHex.textContent = state.config.frameTextColor;
    }

    // Sync Color Modes & Eyes
    if (elements.colorModeSelect) elements.colorModeSelect.value = state.config.colorMode;
    if (elements.bgColor) {
      elements.bgColor.value = state.config.bgColor;
      elements.bgHex.textContent = state.config.bgColor;
    }
    if (elements.transparentBgToggle) elements.transparentBgToggle.checked = !!state.config.transparentBg;
    if (elements.customEyeColorsToggle) {
      elements.customEyeColorsToggle.checked = !!state.config.customEyeColors;
      elements.customEyeSection.style.display = state.config.customEyeColors ? 'grid' : 'none';
    }
    if (elements.eyeFrameColor) {
      elements.eyeFrameColor.value = state.config.eyeFrameColor;
      elements.eyeFrameHex.textContent = state.config.eyeFrameColor;
    }
    if (elements.eyeDotColor) {
      elements.eyeDotColor.value = state.config.eyeDotColor;
      elements.eyeDotHex.textContent = state.config.eyeDotColor;
    }

    // Sync Data Types
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
