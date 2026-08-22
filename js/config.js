// ============================================================
// KONFIGURASI - WEB APP URL
// ============================================================
export const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzp6qgq4XXeRczycb3ttOmijJotXsVgP2DnGJZikcveZhutHree_9vVLpJ-VgsyMBTWRg/exec';

// ============================================================
// KONSTANTA & HELPERS
// ============================================================
export const STATUS = {
  'CRITICAL EVENT':{color:'#dc1018',icon:'!',cls:'red'},
  'SLA BREACH':{color:'#dc1018',icon:'!',cls:'red'},
  'AT RISK':{color:'#f17b0c',icon:'!',cls:'orange'},
  'WARNING':{color:'#f4a900',icon:'!',cls:'amber'},
  'ON TRACK':{color:'#07936f',icon:'✓',cls:'green'},
  'COMPLETED':{color:'#9299a5',icon:'✓',cls:'gray'},
  'NOT STARTED':{color:'#8d96a7',icon:'○',cls:'gray'}
};

export const STAGE_NAMES = [
  'Pre-Alert & Verval',
  'Draft PIB',
  'E-Billing',
  'E-Billing Paid',
  'PIB Terbit',
  'Karantina / Sampling',
  'Uji Lab',
  'Penjaluran',
  'SPPB',
  'Tebus DO / TILA',
  'Delivery / BAST',
  'Empty Return / Closing'
];

export const STAGE_SLA = ['8 Jam','24 Jam','4 Jam','4 Jam','4 Jam','48 Jam','48 Jam','24 Jam','24 Jam','24 Jam','24 Jam','24 Jam'];

export const STAGE_DETAILS = {
  'Pre-Alert & Verval': {
    deskripsi: 'Proses verifikasi dokumen awal dan pre-alert sebelum pengiriman',
    picDefault: 'Officer 1',
    controllerDefault: 'Koord. Operasional',
    steps: ['Input Data Pre-Alert', 'Verifikasi Dokumen', 'Validasi Data', 'Approval Pre-Alert']
  },
  'Draft PIB': {
    deskripsi: 'Pembuatan draft Pemberitahuan Impor Barang (PIB)',
    picDefault: 'Officer 1',
    controllerDefault: 'Koord. Operasional',
    steps: ['Buat Draft PIB', 'Verifikasi Draft PIB', 'Validasi Data PIB']
  },
  'E-Billing': {
    deskripsi: 'Proses pembuatan tagihan elektronik (E-Billing)',
    picDefault: 'Officer 2',
    controllerDefault: 'Koord. Keuangan',
    steps: ['Input Data Billing', 'Verifikasi Billing', 'Generate E-Billing']
  },
  'E-Billing Paid': {
    deskripsi: 'Konfirmasi pembayaran E-Billing',
    picDefault: 'Officer 2',
    controllerDefault: 'Koord. Keuangan',
    steps: ['Verifikasi Pembayaran', 'Update Status Billing', 'Konfirmasi Payment']
  },
  'PIB Terbit': {
    deskripsi: 'Penerbitan PIB setelah pembayaran',
    picDefault: 'Officer 1',
    controllerDefault: 'Koord. Operasional',
    steps: ['Finalisasi PIB', 'Approval PIB', 'Penerbitan PIB']
  },
  'Karantina / Sampling': {
    deskripsi: 'Proses karantina dan pengambilan sampel barang',
    picDefault: 'Officer 3',
    controllerDefault: 'Koord. Karantina',
    steps: ['Daftar Karantina', 'Jadwal Sampling', 'Proses Sampling', 'Hasil Sampling']
  },
  'Uji Lab': {
    deskripsi: 'Pengujian sampel di laboratorium',
    picDefault: 'Officer 2',
    controllerDefault: 'Koord. Karantina',
    steps: ['Kirim Sampel Lab', 'Proses Pengujian Lab', 'Hasil Lab', 'Analisis Hasil']
  },
  'Penjaluran': {
    deskripsi: 'Proses penjaluran barang setelah lolos karantina',
    picDefault: 'Officer 1',
    controllerDefault: 'Koord. Operasional',
    steps: ['Input Data Penjaluran', 'Verifikasi Penjaluran', 'Approval Penjaluran']
  },
  'SPPB': {
    deskripsi: 'Proses Surat Persetujuan Pengeluaran Barang',
    picDefault: 'Officer 1',
    controllerDefault: 'Koord. Karantina',
    steps: ['Buat SPPB', 'Verifikasi SPPB', 'Persetujuan SPPB', 'Cetak SPPB']
  },
  'Tebus DO / TILA': {
    deskripsi: 'Penebusan Delivery Order dan TILA',
    picDefault: 'Officer 1',
    controllerDefault: 'Koord. Operasional',
    steps: ['Input DO', 'Verifikasi DO', 'Penerbitan DO', 'TILA']
  },
  'Delivery / BAST': {
    deskripsi: 'Proses pengiriman dan serah terima barang',
    picDefault: 'Officer 3',
    controllerDefault: 'Koord. Logistik',
    steps: ['Jadwal Delivery', 'Proses Delivery', 'BAST', 'Konfirmasi Penerimaan']
  },
  'Empty Return / Closing': {
    deskripsi: 'Pengembalian container kosong dan closing dokumen',
    picDefault: 'Officer 3',
    controllerDefault: 'Koord. Logistik',
    steps: ['Return Container', 'Verifikasi Container', 'Closing Dokumen']
  }
};

export const MAX_VISIBLE_ROWS = 5;
export const AUTO_REFRESH_MS = 300000;
