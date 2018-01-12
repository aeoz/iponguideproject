// cookie functions
var setCookie = function (cname, cvalue, xdays) {
    var expires = "";
    if (xdays)
    {
      var date = new Date();
      date.setTime(date.getTime()+xdays*24*60*60*1000);
      expires = "; expires=" + date.toGMTString(); 
    }
    document.cookie = cname+"=" + cvalue+expires + ";path=/"; 
}

var checkCookie = function (cname) {
    var checkresult = false;
    var cname=getCookie(cname);
    if (cname != "") {
      checkresult = true;
    } else {
      checkresult = false;
    }
    return checkresult;
}

var getCookie = function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var addCommas = function (nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

// variables
    var frequency,
        startDate = moment(new Date()).format('MM/DD/YYYY'),
        yearEnd = new Date(new Date().getFullYear(), 11, 31),
        endDate = moment(yearEnd).format('MM/DD/YYYY');


jQuery(function($){

    // app code goes end
    $('#intro button').click(function(e){
        e.preventDefault();
        setCookie('step1_active', 'yes', 365);
        hideSection();
        $('#step1').addClass('active');
    });

    $('#step1 button').click(function(e){
        e.preventDefault();
        frequency = $(this).val();
        setCookie('step1_active', 'yes', -1);
        setCookie('step2_active', 'yes', 365);
        hideSection();
        $('#step2').addClass('active');
        $('.frequency').text($(this).text().toLowerCase());
    });


    $('#step2 button').click(function(e){
        e.preventDefault();
        var startDate_selected = $(this).val();

        setCookie('step2_active', 'yes', -1);

        switch (startDate_selected) {
            case 'today':
                startDate = moment(new Date()).format('MM/DD/YYYY');
                break;
            case 'week from now':
                startDate = moment(new Date()).add(1, 'weeks').format('MM/DD/YYYY');
                break;
            case 'Month from now':
                startDate = moment(new Date()).add(1, 'months').format('MM/DD/YYYY');
                break;
            case 'Let me set a date':
                $('.step2-modal').addClass('active'); // show modal
                break;
        }

        if(startDate_selected !== 'Let me set a date') {
            setCookie('step3_active', 'yes', 365);
            hideSection();
            $('#step3').addClass('active');
        }
        
    });

    $('.step2-modal input').on('keyup', function(e){
        if($(this).val().length == 10) {
            startDate = $(this).val();
            setCookie('step3_active', 'yes', 365);
            hideSection();
            $('#step3').addClass('active');
        }
    });

    $('#step3 button').click(function(e){
        e.preventDefault();
        var endDate_selected = $(this).val();

        setCookie('step3_active', 'yes', -1);

        switch (endDate_selected) {
            case 'Until the end of the year':
                endDate = moment(yearEnd).format('MM/DD/YYYY');
                break;
            case 'Year from now':
                endDate = moment(new Date()).add(1, 'years').format('MM/DD/YYYY'); // set 1 year
                break;
            case 'Let me set a date':
                $('.step3-modal').addClass('active'); // show modal
                break;
        }

        if(endDate_selected !== 'Let me set a date') {
            setCookie('step4_active', 'yes', 365);
            hideSection();
            $('#step4').addClass('active');
        }
        
    });

    $('.step3-modal input').on('keyup', function(e){
        if($(this).val().length == 10) {
            endDate = $(this).val();
            setCookie('step4_active', 'yes', 365);
            hideSection();
            $('#step4').addClass('active');
        }
    });

    $('.step2-modal input, .step3-modal input').focus(function(){
        $(this).val('');
    });

    $('.step2-modal input, .step3-modal input').mask('00/00/0000');


    $('#step4 button').click(function(e){
        e.preventDefault();
        setCookie('step4_active', 'yes', -1);
        setCookie('step5_active', 'yes', 365);
        hideSection();
        $('#step5').addClass('active');
    });


    $('#step5 button').click(function(e){

        e.preventDefault();
        setCookie('step5_active', 'yes', -1);
        setCookie('step6_active', 'yes', 365);

        var button_val = $(this).val();

        if(button_val == 'Yes' || button_val == 'No') {
            $('#step5 .btn-group button').removeClass('active');
        }

        if(button_val === 'Yes') {
            $(this).addClass('active');
            $('.daily-increase').slideDown();
        } else if (button_val === 'No') {
            $(this).addClass('active');
            $('.daily-increase').slideUp();
            $('#increase-amount').val('');
        } else {
            hideSection();
            $('#step6').addClass('active');
        }

        calculateTotal(); // append values
        
    });

    $('#step6 button').click(function(e){
        e.preventDefault();
        setCookie('step6_active', 'yes', -1);
        setCookie('step7_active', 'yes', 365);
        hideSection();
        $('#step7').addClass('active');
    });

    $('.back-button').click(function(e){
        var stepback = parseInt($(this).parents('section').attr('id').replace('step', '')) - 1;
        hideSection();
        $('#step' + stepback).addClass('active');
        $('.app-container').removeClass('disable-flex');
    });

    function hideSection() {
        $('.app-container section, .step2-modal, .step3-modal').removeClass('active');
    }

    function calculateTotal() {

        var startAmount = parseInt($('#start-amount').val().replace(/[\D\s\._\-]+/g, "")),
            saveIncrement = $('#increase-amount').val() !== '' ? parseInt($('#increase-amount').val().replace(/[\D\s\._\-]+/g, "")) : 0,
            daysLeft = moment(endDate).diff(moment(startDate), frequency);

        var totalAmount = startAmount;
        var initialIncrement = startAmount;
        var SavingSched = "";

        $('.sched-results-wrap, .total-saving-amount').html('');

        for(var x=0; x<daysLeft;x++) {

            if(saveIncrement != 0 && x > 0)
                initialIncrement += saveIncrement;

            if(x>0) 
                totalAmount += initialIncrement;

            SavingSched += "<div class='sched-results'><div>P" + addCommas(initialIncrement) + "</div><div>" + moment(startDate).add(x, frequency).format('MM/DD/YYYY') + "</div><div>P" + addCommas(totalAmount) + "</div></div>";
 
        }

        $('.sched-results-wrap').append(SavingSched);
        $('.total-saving-amount').text('P' + addCommas(totalAmount));

        $('.app-container').addClass('disable-flex');

    }


    // validation
    $('input[type="tel"], input[type="number"]').keydown(function(e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 224, 17, 91, 93]) !== -1 ||
            // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
            (e.keyCode == 65 && e.metaKey === true) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) { // Allow: home, end, left, right
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });


    // input format
    $('#start-amount, #increase-amount').on('keyup', function(e) {
        var amount = $(this).val().indexOf('$') > -1 ? $(this).val().slice(1) : $(this).val();
        amount = amount.split(',').join('');
        $(this).val(addCommas(amount));
    });




});