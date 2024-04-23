window.onload = function() {
    updateTimer(); // Call the function to immediately update the timer

    var countdownTimer = setInterval(updateTimer, 1000); // Update the timer every second

    function updateTimer() {
        var now = new Date();
        var endTime = new Date(now);
        endTime.setHours(23, 59, 59, 999); // Set to end of the current day (23:59:59.999)
        
        var timeRemaining = endTime - now;

        var hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        // Format hours, minutes, and seconds as "HH:MM:SS"
        var formattedTime = (hours < 10 ? "0" + hours : hours) + "<span class='font-body-bold'>H : </span>" + (minutes < 10 ? "0" + minutes : minutes) + "<span class='font-body-bold'>M : </span>" + (seconds < 10 ? "0" + seconds : seconds) + "<span class='font-body-bold'>S </span>";

        document.getElementById("timer").innerHTML = formattedTime;

        if (timeRemaining <= 0) {
            clearInterval(countdownTimer);
            document.getElementById("timer").innerHTML = "<span class='font-body-bold'>00H : 00M : 00S</span>"; // Optional: Display a message when countdown ends
            // You can add code to hide or disable the relevant elements here
        }
    }
};
