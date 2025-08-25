const ctx = document
  .getElementById("thesisCompletionTimeChart")
  .getContext("2d");

// TODO: Sample data
const years = ["2018-2021", "2022", "2023", "2024", "2025"]; // last few years separate
const avgTimeSupervisor = [15, 12, 13, 11, 10]; // months, for example
const avgTimeCommittee = [16, 13, 14, 12, 11];

const data = {
  labels: years,
  datasets: [
    {
      label: "Επιβλέπων",
      data: avgTimeSupervisor,
      backgroundColor: "rgba(54, 162, 235, 0.7)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    },
    {
      label: "Μέλος Τριμελούς",
      data: avgTimeCommittee,
      backgroundColor: "rgba(255, 99, 132, 0.7)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1,
    },
  ],
};

const config = {
  type: "bar",
  data: data,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Μέσος Χρόνος Περάτωσης Διπλωματικών",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      x: {
        stacked: false,
        title: {
          display: true,
          text: "Έτη",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Μήνες",
        },
      },
    },
  },
};

const avgTimeChart = new Chart(ctx, config);
