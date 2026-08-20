// ============================================================
// DUMMY DATA (Fallback jika API gagal)
// ============================================================

export const DEMO_DATA = {
    lastUpdate: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) + ' WIB',
    
    metrics: [
        { status: 'CRITICAL EVENT', count: 3 },
        { status: 'SLA BREACH', count: 3 },
        { status: 'AT RISK', count: 5 },
        { status: 'WARNING', count: 4 },
        { status: 'ON TRACK', count: 4 },
        { status: 'COMPLETED', count: 4 }
    ],
    
    overall: {
        onTrack: 10,
        atRisk: 5,
        late: 2,
        total: 23
    },
    
    regions: ['Jakarta', 'Medan', 'Surabaya', 'Semarang'],
    
    alerts: [
        {
            idOrder: 'ORD-2026-0008',
            priority: 'CRITICAL EVENT',
            bl: 'BL-2026-0008',
            container: 'TCLU1234567',
            stage: 'Uji Lab',
            slaHours: 48,
            slaUsedPct: 1.06,
            remainingHours: -3,
            currentCheckpoint: '5.5 Proses Pengujian Lab',
            pic: 'Officer 2',
            controller: 'Koord. Karantina',
            escalationStatus: 'PIMPRO',
            overallStatus: 'ON TRACK',
            overallRemainingHours: 125.3,
            update: '16 Mei 15:25',
            origin: 'India',
            region: 'Jakarta',
            issue: 'Sample / Hasil Lab REJECT',
            action: 'Officer 2 sudah konfirmasi ke Lab 2x; Lab targetkan selesai hari ini 16:00; diminta percepatan proses pengujian',
            escalationLevel: 3,
            targetFinish: '16 Mei 16:00',
            start: '13 Mei 14:00',
            overallElapsedHours: 42.7
        },
        {
            idOrder: 'ORD-2026-0012',
            priority: 'SLA BREACH',
            bl: 'BL-2026-0012',
            container: 'TRLU7654321',
            stage: 'Tebus DO / TILA',
            slaHours: 24,
            slaUsedPct: 0.92,
            remainingHours: -6,
            currentCheckpoint: '10.2 Proses Penerbitan DO',
            pic: 'Officer 1',
            controller: 'Koord. Operasional',
            escalationStatus: 'Koord. Kanwil',
            overallStatus: 'AT RISK',
            overallRemainingHours: 1.17,
            update: '16 Mei 09:12',
            origin: 'China',
            region: 'Jakarta',
            issue: 'DO belum terbit',
            action: 'Follow-up shipping line',
            escalationLevel: 2,
            targetFinish: '16 Mei 10:00',
            start: '15 Mei 10:00',
            overallElapsedHours: 166.83
        },
        {
            idOrder: 'ORD-2026-0015',
            priority: 'SLA BREACH',
            bl: 'BL-2026-0015',
            container: 'BEAU9876543',
            stage: 'SPPB',
            slaHours: 24,
            slaUsedPct: 0.87,
            remainingHours: -4,
            currentCheckpoint: '9.3 Persetujuan SPPB',
            pic: 'Officer 1',
            controller: 'Koord. Karantina',
            escalationStatus: 'Koord. Kanwil',
            overallStatus: 'ON TRACK',
            overallRemainingHours: 2.75,
            update: '16 Mei 10:28',
            origin: 'Vietnam',
            region: 'Surabaya',
            issue: 'SPPB menunggu persetujuan',
            action: 'Follow-up approval',
            escalationLevel: 2,
            targetFinish: '16 Mei 14:00',
            start: '15 Mei 14:00',
            overallElapsedHours: 165.25
        },
        {
            idOrder: 'ORD-2026-0018',
            priority: 'AT RISK',
            bl: 'BL-2026-0018',
            container: 'SKLU2468135',
            stage: 'Karantina / Sampling',
            slaHours: 48,
            slaUsedPct: 0.72,
            remainingHours: 6,
            currentCheckpoint: '4.4 Proses Sampling',
            pic: 'Officer 3',
            controller: 'Koord. Karantina',
            escalationStatus: 'Officer 3',
            overallStatus: 'ON TRACK',
            overallRemainingHours: 1.92,
            update: '16 Mei 12:35',
            origin: 'India',
            region: 'Medan',
            issue: 'Menunggu sampling',
            action: 'Koordinasi petugas karantina',
            escalationLevel: 1,
            targetFinish: '16 Mei 18:00',
            start: '14 Mei 18:00',
            overallElapsedHours: 166.08
        },
        {
            idOrder: 'ORD-2026-0021',
            priority: 'AT RISK',
            bl: 'BL-2026-0021',
            container: 'TCLU1357924',
            stage: 'Tebus DO / TILA',
            slaHours: 24,
            slaUsedPct: 0.68,
            remainingHours: 8,
            currentCheckpoint: '10.1 Input & Verifikasi DO',
            pic: 'Koord. Karantina',
            controller: 'Koord. Operasional',
            escalationStatus: 'Koord. Kanwil',
            overallStatus: 'AT RISK',
            overallRemainingHours: 0.92,
            update: '16 Mei 15:40',
            origin: 'Thailand',
            region: 'Semarang',
            issue: 'Verifikasi DO',
            action: 'Review data DO',
            escalationLevel: 2,
            targetFinish: '16 Mei 23:40',
            start: '15 Mei 23:40',
            overallElapsedHours: 167.08
        }
    ],
    
    history: {
        'ORD-2026-0008': [
            { name: 'Sampling Selesai', status: 'COMPLETED', start: '13 Mei 09:10', elapsed: 2, sla: null, used: 1, remaining: 'Selesai', pic: 'Officer 3' },
            { name: 'Handover Sample', status: 'COMPLETED', start: '13 Mei 11:10', elapsed: 1, sla: null, used: 1, remaining: 'Selesai', pic: 'Officer 3' },
            { name: 'Pickup Sample', status: 'COMPLETED', start: '13 Mei 12:30', elapsed: 1, sla: null, used: 1, remaining: 'Selesai', pic: 'Officer 2' },
            { name: 'Sample Diterima Lab', status: 'COMPLETED', start: '13 Mei 14:00', elapsed: 1, sla: null, used: 1, remaining: 'Selesai', pic: 'Officer 2' },
            { name: 'Proses Pengujian Lab', status: 'SLA BREACH', start: '13 Mei 14:00', elapsed: 51, sla: 48, used: 1.06, remaining: '-3 Jam (Overdue)', pic: 'Officer 2' },
            { name: 'Hasil Lab Diterima', status: 'NOT STARTED', start: '-', elapsed: 0, sla: 4, used: 0, remaining: '4 Jam', pic: 'Officer 2' },
            { name: 'Pickup Hasil Lab', status: 'NOT STARTED', start: '-', elapsed: 0, sla: 1, used: 0, remaining: '1 Jam', pic: 'Officer 2' }
        ]
    },
    
    flows: {
        'ORD-2026-0008': [
            'PIC / Koordinator Karantina (Officer 2)',
            'Pimpinan Proyek (Pimpro)',
            'PIC Pengadaan LN PPI',
            'Top Management PPI'
        ]
    },
    
    timelines: {
        'ORD-2026-0008': [
            { time: '16 Mei 15:25', desc: 'Escalasi Level 1\n(Officer 2 → Koord. Karantina)', state: 'done' },
            { time: '16 Mei 15:30', desc: 'Escalasi Level 2\n(Koord. Karantina → Pimpro)', state: 'done' },
            { time: '16 Mei 15:35', desc: 'Escalasi Level 3\n(Pimpro → PIC Pengadaan LN PPI)', state: 'wait' },
            { time: '16 Mei 15:xx', desc: 'Escalasi Level 4\n(PPIC → Top Management PPI)', state: 'pending' }
        ]
    }
};
