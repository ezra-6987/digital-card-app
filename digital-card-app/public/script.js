function enterApp() {
    alert('Welcome to the Digital Card App!');
  }
  
  function enterApp() {
    window.location.href = '/image-selection';
  }

  function checkTrackingNumber() {
    const trackingNumber = document.getElementById('trackingNumber').value;
    if (trackingNumber) {
      alert(`Tracking Number ${trackingNumber} checked!`);
    } else {
      alert('Please enter a tracking number.');
    }
  }
  