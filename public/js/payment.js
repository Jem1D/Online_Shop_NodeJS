import {loadStripe} from '@stripe/stripe-js';

var stripe = await loadStripe('pk_test_51LBZzaSCGY2MLdIfnHZX7Pki4S9ZBku3PbFFDAsZqCj7ax1Ufa6EbVnmeo79C1J5Zne3BFwJWqsGLrN088HbFYBU00ylNy0djF');

// var stripe = Stripe('pk_test_51LBZzaSCGY2MLdIfnHZX7Pki4S9ZBku3PbFFDAsZqCj7ax1Ufa6EbVnmeo79C1J5Zne3BFwJWqsGLrN088HbFYBU00ylNy0djF')
var orderBtn = document.getElementById('order-btn')
orderBtn.addEventListener('click', function() {
  stripe.redirectToCheckout({
    sessionId:'<%= sessionId%>'
  })
})