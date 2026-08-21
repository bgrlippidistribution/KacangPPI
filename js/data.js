import { WEBAPP_URL } from './config.js';

export const DEMO_DATA = {
  lastUpdate: new Date().toLocaleString('id-ID', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) + ' WIB',
  metrics: [
    {status:'CRITICAL EVENT',count:3},
    {status:'SLA BREACH',count:3},
    {status:'AT RISK',count:5},
    {status:'WARNING',count:4},
    {status:'ON TRACK',count:4},
    {status:'COMPLETED',count:4}
  ],
  overall: {onTrack:10, atRisk:5, late:2, total:23},
  regions: ['Jakarta','Medan','Surabaya','Semarang'],
  alerts: [
    {
      idOrder:'ORD-2026-0008',
      priority:'CRITICAL EVENT',
      bl:'BL-2026-0008',
      container:'TCLU1234567',
      stage:'Uji Lab',
      slaHours:48,
      slaUsedPct:1.06,
      remainingHours:-3,
      currentCheckpoint:'5.5 Proses Pengujian Lab',
      pic:'Officer 2',
      controller:'Koord. Karantina',
      escalationStatus:'PIMPRO',
      overallStatus:'ON TRACK',
      overallRemainingHours:125.3,
      update:'16 Mei 15:25',
      origin:'India',
      region:'Jakarta',
      issue:'Sample / Hasil Lab REJECT',
      action:'Officer 2 sudah konfirmasi ke Lab 2x; Lab targetkan selesai hari ini 16:00; diminta percepatan proses pengujian',
      escalationLevel:3,
      targetFinish:'16 Mei 16:00',
      start:'13 Mei 14:00',
      overallElapsedHours:42.7
    },
    {
      idOrder:'ORD-2026-0012',
      priority:'SLA BREACH',
      bl:'BL-2026-0012',
      container:'TRLU7654321',
      stage:'Tebus DO / TILA',
      slaHours:24,
      slaUsedPct:.92,
      remainingHours:-6,
      currentCheckpoint:'10.2 Proses Penerbitan DO',
      pic:'Officer 1',
      controller:'Koord. Operasional',
      escalationStatus:'Koord. Kanwil',
      overallStatus:'AT RISK',
      overallRemainingHours:1.17,
      update:'16 Mei 09:12',
      origin:'China',
      region:'Jakarta',
      issue:'DO belum terbit',
      action:'Follow-up shipping line',
      escalationLevel:2,
      targetFinish:'16 Mei 10:00',
      start:'15 Mei 10:00',
      overallElapsedHours:166.83
    },
    {
      idOrder:'ORD-2026-0015',
      priority:'SLA BREACH',
      bl:'BL-2026-0015',
      container:'BEAU9876543',
      stage:'SPPB',
      slaHours:24,
      slaUsedPct:.87,
      remainingHours:-4,
      currentCheckpoint:'9.3 Persetujuan SPPB',
      pic:'Officer 1',
      controller:'Koord. Karantina',
      escalationStatus:'Koord. Kanwil',
      overallStatus:'ON TRACK',
      overallRemainingHours:2.75,
      update:'16 Mei 10:28',
      origin:'Vietnam',
      region:'Surabaya',
      issue:'SPPB menunggu persetujuan',
      action:'Follow-up approval',
      escalationLevel:2,
      targetFinish:'16 Mei 14:00',
      start:'15 Mei 14:00',
      overallElapsedHours:165.25
    },
    {
      idOrder:'ORD-2026-0018',
      priority:'AT RISK',
      bl:'BL-2026-0018',
      container:'SKLU2468135',
      stage:'Karantina / Sampling',
      slaHours:48,
      slaUsedPct:.72,
      remainingHours:6,
      currentCheckpoint:'4.4 Proses Sampling',
      pic:'Officer 3',
      controller:'Koord. Karantina',
      escalationStatus:'Officer 3',
      overallStatus:'ON TRACK',
      overallRemainingHours:1.92,
      update:'16 Mei 12:35',
      origin:'India',
      region:'Medan',
      issue:'Menunggu sampling',
      action:'Koordinasi petugas karantina',
      escalationLevel:1,
      targetFinish:'16 Mei 18:00',
      start:'14 Mei 18:00',
      overallElapsedHours:166.08
    },
    {
      idOrder:'ORD-2026-0021',
      priority:'AT RISK',
      bl:'BL-2026-0021',
      container:'TCLU1357924',
      stage:'Tebus DO / TILA',
      slaHours:24,
      slaUsedPct:.68,
      remainingHours:8,
      currentCheckpoint:'10.1 Input & Verifikasi DO',
      pic:'Koord. Karantina',
      controller:'Koord. Operasional',
      escalationStatus:'Koord. Kanwil',
      overallStatus:'AT RISK',
      overallRemainingHours:.92,
      update:'16 Mei 15:40',
      origin:'Thailand',
      region:'Semarang',
      issue:'Verifikasi DO',
      action:'Review data DO',
      escalationLevel:2,
      targetFinish:'16 Mei 23:40',
      start:'15 Mei 23:40',
      overallElapsedHours:167.08
    }
  ],
  history: {
    'ORD-2026-0008': [
      {name:'Sampling Selesai',status:'COMPLETED',start:'13 Mei 09:10',elapsed:2,sla:null,used:1,remaining:'Selesai',pic:'Officer 3'},
      {name:'Handover Sample',status:'COMPLETED',start:'13 Mei 11:10',elapsed:1,sla:null,used:1,remaining:'Selesai',pic:'Officer 3'},
      {name:'Pickup Sample',status:'COMPLETED',start:'13 Mei 12:30',elapsed:1,sla:null,used:1,remaining:'Selesai',pic:'Officer 2'},
      {name:'Sample Diterima Lab',status:'COMPLETED',start:'13 Mei 14:00',elapsed:1,sla:null,used:1,remaining:'Selesai',pic:'Officer 2'},
      {name:'Proses Pengujian Lab',status:'SLA BREACH',start:'13 Mei 14:00',elapsed:51,sla:48,used:1.06,remaining:'-3 Jam (Overdue)',pic:'Officer 2'},
      {name:'Hasil Lab Diterima',status:'NOT STARTED',start:'-',elapsed:0,sla:4,used:0,remaining:'4 Jam',pic:'Officer 2'},
      {name:'Pickup Hasil Lab',status:'NOT STARTED',start:'-',elapsed:0,sla:1,used:0,remaining:'1 Jam',pic:'Officer 2'}
    ]
  },
  checkpoints: {
    'ORD-2026-0008': [
      {stage:'Uji Lab',checkpoint:1,name:'Kirim Sampel Lab',status:'COMPLETED',startTime:'13 Mei 12:30',completedAt:'13 Mei 14:00',pic:'Officer 2'},
      {stage:'Uji Lab',checkpoint:2,name:'Proses Pengujian Lab',status:'SLA BREACH',startTime:'13 Mei 14:00',completedAt:'-',pic:'Officer 2'},
      {stage:'Uji Lab',checkpoint:3,name:'Hasil Lab',status:'NOT STARTED',startTime:'-',completedAt:'-',pic:'Officer 2'},
      {stage:'Uji Lab',checkpoint:4,name:'Analisis Hasil',status:'NOT STARTED',startTime:'-',completedAt:'-',pic:'Officer 2'}
    ]
  },
  evidence: {
    'ORD-2026-0008': [
      {
        stage:'Uji Lab',
        checkpoint:1,
        checkpointName:'Kirim Sampel Lab',
        title:'Form Handover Sampel',
        thumbnailUrl:'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22640%22 height=%22360%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f7f9fc%22/%3E%3Crect x=%2235%22 y=%2230%22 width=%22570%22 height=%22300%22 rx=%228%22 fill=%22white%22 stroke=%22%23c9d5e3%22 stroke-width=%222%22/%3E%3Ctext x=%2260%22 y=%2270%22 font-family=%22Arial%22 font-size=%2222%22 font-weight=%22bold%22 fill=%22%2306244d%22%3EFORM HANDOVER SAMPEL%3C/text%3E%3Cline x1=%2260%22 y1=%2290%22 x2=%22580%22 y2=%2290%22 stroke=%22%23d7e0ea%22/%3E%3Ctext x=%2260%22 y=%22125%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%234b6786%22%3EB/L: BL-2026-0008%3C/text%3E%3Ctext x=%2260%22 y=%22155%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%234b6786%22%3EContainer: TCLU1234567%3C/text%3E%3Ctext x=%2260%22 y=%22185%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%234b6786%22%3ETanggal: 13 Mei 2026%3C/text%3E%3Crect x=%2260%22 y=%22215%22 width=%22520%22 height=%2270%22 fill=%22%23eef4fa%22 stroke=%22%23d3dfeb%22/%3E%3Ctext x=%2280%22 y=%22255%22 font-family=%22Arial%22 font-size=%2215%22 fill=%22%23385677%22%3ESampel telah diserahkan ke petugas laboratorium%3C/text%3E%3C/svg%3E',
        uploadedAt:'13 Mei 2026 14:00',
        uploadedBy:'Officer 2',
        validationStatus:'VALID'
      },
      {
        stage:'Uji Lab',
        checkpoint:2,
        checkpointName:'Proses Pengujian Lab',
        title:'Bukti Proses Pengujian',
        thumbnailUrl:'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22640%22 height=%22360%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f7f9fc%22/%3E%3Crect x=%2235%22 y=%2230%22 width=%22570%22 height=%22300%22 rx=%228%22 fill=%22white%22 stroke=%22%23c9d5e3%22 stroke-width=%222%22/%3E%3Ctext x=%2260%22 y=%2270%22 font-family=%22Arial%22 font-size=%2222%22 font-weight=%22bold%22 fill=%22%2306244d%22%3EPROSES PENGUJIAN LAB%3C/text%3E%3Cline x1=%2260%22 y1=%2290%22 x2=%22580%22 y2=%2290%22 stroke=%22%23d7e0ea%22/%3E%3Ctext x=%2260%22 y=%22130%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%234b6786%22%3ESample ID: LAB-2026-0058%3C/text%3E%3Ctext x=%2260%22 y=%22165%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%234b6786%22%3EStatus: DALAM PENGUJIAN%3C/text%3E%3Crect x=%2260%22 y=%22205%22 width=%22520%22 height=%2230%22 rx=%2215%22 fill=%22%23f4d9da%22/%3E%3Crect x=%2260%22 y=%22205%22 width=%22435%22 height=%2230%22 rx=%2215%22 fill=%22%23dc1018%22/%3E%3Ctext x=%22275%22 y=%22227%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 font-weight=%22bold%22 fill=%22white%22%3E106%25 SLA%3C/text%3E%3Ctext x=%2260%22 y=%22280%22 font-family=%22Arial%22 font-size=%2215%22 fill=%22%23a31218%22%3EOverdue 3 jam - percepatan diminta%3C/text%3E%3C/svg%3E',
        uploadedAt:'16 Mei 2026 15:25',
        uploadedBy:'Officer 2',
        validationStatus:'BELUM DIVERIFIKASI'
      }
    ]
  },
  flows: {
    'ORD-2026-0008': ['PIC / Koordinator Karantina (Officer 2)','Pimpinan Proyek (Pimpro)','PIC Pengadaan LN PPI','Top Management PPI']
  },
  timelines: {
    'ORD-2026-0008': [
      {time:'16 Mei 15:25',desc:'Escalasi Level 1\n(Officer 2 → Koord. Karantina)',state:'done'},
      {time:'16 Mei 15:30',desc:'Escalasi Level 2\n(Koord. Karantina → Pimpro)',state:'done'},
      {time:'16 Mei 15:35',desc:'Escalasi Level 3\n(Pimpro → PIC Pengadaan LN PPI)',state:'wait'},
      {time:'16 Mei 15:xx',desc:'Escalasi Level 4\n(PPIC → Top Management PPI)',state:'pending'}
    ]
  }
};

export const dashboardState = {
  data: DEMO_DATA,
  selectedId: null,
  selectedStageIndex: -1,
  isExpanded: false
};

export function setDashboardData(data) {
  dashboardState.data = data || DEMO_DATA;
}

export async function fetchDataFromSpreadsheet() {
  try {
    const url = WEBAPP_URL;
    console.log('📡 Mengambil data dari:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      console.error('❌ API Error:', data.error);
      console.log('📌 Menggunakan data dummy sebagai fallback');
      return DEMO_DATA;
    }
    console.log('✅ Data berhasil diambil:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching spreadsheet data:', error);
    console.log('📌 Menggunakan data dummy sebagai fallback');
    return DEMO_DATA;
  }
}
