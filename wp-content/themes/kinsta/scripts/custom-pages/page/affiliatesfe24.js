(function($) {

  function formatAmountForBar(amount) {
    if( amount < 10000 ) {
      return amount.toLocaleString();
    } else {
      return Number(Math.round((amount / 1000)+'e1')+'e-1') + 'k';
    }
  }



  function recalculateAffiliateChart() {

    var monthlyCount = $('#new-subscriptions').val();
    var plan = $('#plan-type').val().split('|');
    var price = plan[0];
    var onetime = plan[1];
    var passed_thousand = false;
    var reached_limit = false;
    $.each($('.earnings-bar'), function(i, bar) {
      var amount = (monthlyCount * onetime) + (monthlyCount*(i +1) - monthlyCount) * (price/10);
      if( (amount >= 1000 && passed_thousand === false) || (i === 12 && passed_thousand === false) ) {
        if(i === 12 && passed_thousand === false) {
          reached_limit = false;
          passed_thousand = false;
        } else {
          reached_limit = true;
          passed_thousand = true;
        }

        var halfYear = (monthlyCount * onetime) + (monthlyCount*6 - monthlyCount) * (price/10)

        $('#thousand_marker').find('.amount').text('$' + halfYear.toLocaleString())

      } else {
        reched_limit = false;
      }



      $(bar).find('.amount').text('$' + formatAmountForBar(amount))
    })

    var afterAYear = (monthlyCount * onetime) + (monthlyCount*13 - monthlyCount) * (price/10);
    $('#after-a-year').html('$' + afterAYear.toLocaleString());


  }

  $(document).on('submit', '#affiliate-calculation-form', function() {
    tagHotjarRecording('Affiliate Chart Interaction')
    recalculateAffiliateChart();
    return false;
  })

  $(document).on('keyup', '#new-subscriptions', function() {
    tagHotjarRecording('Affiliate Chart Interaction')
    if($('#new-subscriptions').val() !== '') {
      recalculateAffiliateChart();
    }
  })

  $(document).on('change', '#new-subscriptions', function() {
    tagHotjarRecording('Affiliate Chart Interaction')
    recalculateAffiliateChart();
  })

  $(document).on('change', '#plan-type', function() {
    tagHotjarRecording('Affiliate Chart Interaction')
    recalculateAffiliateChart();
  })


})( jQuery );
