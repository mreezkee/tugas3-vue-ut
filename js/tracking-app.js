var app = new Vue({
  el: "#app",
  // DATA (Tempat Menyimpan Variabel)
  data: {
    searchQuery: "",
    showModal: false,
    isProcessing: false,
    isSuccess: false,
    sidebarOpen: false,

    pengirimanList: [
      { kode: "REG", nama: "Reguler (3-5 hari)" },
      { kode: "EXP", nama: "Ekspres (1-2 hari)" },
    ],
    paket: [
      {
        kode: "PAKET-UT-001",
        nama: "PAKET IPS Dasar",
        isi: ["EKMA4116", "EKMA4115"],
        harga: 120000,
      },
      {
        kode: "PAKET-UT-002",
        nama: "PAKET IPA Dasar",
        isi: ["BIOL4201", "FISIP4001"],
        harga: 140000,
      },
    ],

    //Variable Penampng input DO baru
    formDO: {
      noDO: "",
      nim: "",
      nama: "",
      kodePaket: "",
      pengiriman: "",
      tanggalKirim: "",
      totalHarga: 0,
    },

    //Data Dummy
    riwayatDO: [
      {
        noDO: "DO2026-001",
        nim: "012345678",
        nama: "Vino G. Bastian",
        namaPaket: "PAKET IPS Dasar",
        kodePaket: "PAKET-UT-001",
        pengiriman: "Reguler (3-5 hari)",
        tanggalKirim: "2026-05-20",
        totalHarga: 120000,
        status: "Dikirim",
      },
      {
        noDO: "DO2026-002",
        nim: "012345679",
        nama: "M. Rizqi Pratama",
        namaPaket: "PAKET IPA Dasar",
        kodePaket: "PAKET-UT-002",
        pengiriman: "Reguler (3-5 hari)",
        tanggalKirim: "2026-05-22",
        totalHarga: 140000,
        status: "Penjemputan",
      },
      {
        noDO: "DO2026-003",
        nim: "012345680",
        nama: "Lionel Messi",
        namaPaket: "PAKET IPA Dasar",
        kodePaket: "PAKET-UT-002",
        pengiriman: "Reguler (3-5 hari)",
        tanggalKirim: "2026-05-22",
        totalHarga: 140000,
        status: "Proses Gudang",
      },
      {
        noDO: "DO2026-004",
        nim: "012345681",
        nama: "Adit",
        namaPaket: "PAKET IPS Dasar",
        kodePaket: "PAKET-UT-001",
        pengiriman: "Reguler (3-5 hari)",
        tanggalKirim: "2026-05-22",
        totalHarga: 120000,
        status: "Sudah Diterima",
      },
    ],
  },
  mounted: function () {
    // Cek ingatan browser saat halaman dimuat
    if (localStorage.getItem("temaSitta") === "dark") {
      document.body.classList.add("dark-mode");
    }
  },
  computed: {
    //Logika filter doTersaring
    doTersaring: function () {
      if (this.searchQuery === "") {
        return this.riwayatDO;
      } else {
        let keyword = this.searchQuery.toLowerCase();
        return this.riwayatDO.filter((item) => {
          return item.noDO.toLowerCase().includes(keyword);
        });
      }
    },

    detailPaketTerpilih: function () {
      if (this.formDO.kodePaket === "") return null;

      return this.paket.find((p) => p.kode === this.formDO.kodePaket);
    },
  },

  watch: {
    // Memantau kodePaket
    "formDO.kodePaket": function (kodeTerpilih) {
      if (kodeTerpilih !== "") {
        let paketDitemukan = this.paket.find((p) => p.kode === kodeTerpilih);
        if (paketDitemukan) {
          this.formDO.totalHarga = paketDitemukan.harga;
        }
      } else {
        this.formDO.totalHarga = 0;
      }
    },
  },

  methods: {
    bukaModalTambah: function () {
      // Logika Generate noDO dan tanggal
      let tahun = new Date().getFullYear();
      let jumlahData = this.riwayatDO.length + 1;
      let urutan = String(jumlahData).padStart(3, "0");
      let hariIni = new Date().toISOString().split("T")[0];

      this.formDO.noDO = "DO" + tahun + "-" + urutan;
      this.formDO.tanggalKirim = hariIni;
      this.showModal = true;
    },
    simpanDO: function () {
      this.showModal = false;
      this.isProcessing = true;
      setTimeout(() => {
        this.isProcessing = false;
        this.isSuccess = true;

        //Simpan Data
        let namaPaketTerpilih = "";
        let paketDitemukan = this.paket.find(
          (p) => p.kode === this.formDO.kodePaket,
        );
        if (paketDitemukan) {
          namaPaketTerpilih = paketDitemukan.nama;
        }

        let dataBaru = {
          noDO: this.formDO.noDO,
          nim: this.formDO.nim,
          nama: this.formDO.nama,
          kodePaket: this.formDO.kodePaket,
          namaPaket: namaPaketTerpilih,
          pengiriman: this.formDO.pengiriman,
          tanggalKirim: this.formDO.tanggalKirim,
          totalHarga: this.formDO.totalHarga,
          status: "Proses Gudang",
        };
        //push data
        this.riwayatDO.push(dataBaru);

        //reset form
        this.formDO = {
          noDO: "",
          nim: "",
          nama: "",
          kodePaket: "",
          pengiriman: "",
          tanggalKirim: "",
          totalHarga: 0,
        };

        setTimeout(() => {
          this.isSuccess = false;
        }, 1500);
      }, 1500);
    },
  },
});
