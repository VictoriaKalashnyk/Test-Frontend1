'use strict';

$(function() {
	
 	$('.rateStar').ratemate({ width: 100, height: 100 });
		
	var http = 'http://smktesting.herokuapp.com/';
	var token = undefined;
	var index = undefined;
	
/* --- List of products --- */
 	$.ajax({
		url: http + 'api/products/',
		type: 'GET',    
		dataType: 'json', 
		success: function(data) {
			for(var i = 0; i < data.length; i++) { 
				$('.product-list').append('<li class="product-item">' + data[i].title + '<div class="product-image"><img src="' 
										   + http + '/static/' + data[i].img + '" width="116" height="108" alt="Product"></div></li>');
				var id = data[i].id;
				console.log(id);	
			}
			
			$('.product-item').click(function(event) {
				event.preventDefault();
				$('.product-item').removeClass('active');
				$(this).addClass('active');
			});
	
		/* --- Product Description --- */
			$('.product-item').on('click', function(event){
				event.preventDefault();
				var indexNumber = $('.product-item').index(this);
				index = indexNumber + 1;
				
				$.ajax({
					url: http + 'api/products/',
					type: 'GET',    
					dataType: 'json', 
					success: function(data) {
						for(var i = 0; i < data.length; i++) { 
							$('.product-info').append('<div class="product" id="product' + data[i].id 
														+ '"><h3 class="product__caption">' + data[i].title 
														+ '</h3>' + '<img src="' + http + '/static/' + data[i].img 
														+ '" width="232" height="217" alt="Product">'
														+ '<p class="product__description">' + data[i].text + '</p>' 
														+ '</div>');
						}
						$('.product').hide();
						$('#product' + index).show();
					},
					error: function(errorMsg) {
						$('.catalog__product_error').append('<h3>К сожалению описание товара недоступно, попробуйте зайти позже</h3>');
					}
				}); 
				
			/* --- Reviews for the product --- */
				$.ajax({
					url: http + 'api/reviews/' + index,
					type: 'GET',    
					dataType: 'json', 
					success: function(reviews) {
						$('.product-details').hide(); 
						$('.product').hide();
						$('#product' + index).show();
						
						for(var j = reviews.length-1; j >= 0 ; j--) {
							$('.comment').append('<div class="product-details"><p class="created">' + reviews[j].created_by.username 
												 + ' <span class="time"> ' + reviews[j].created_at + '</span></p><p class="rate">Rate: <span>' 
												 + reviews[j].rate + '</span></p>' + '<p class="comment-text">Comment: <span>' 
												 + reviews[j].text + '</span></p></div>');
							$('.comment').show();
						}
					},
					error: function(errorMsg) {
						$('.catalog__product_error').append('<h3>К сожалению список отзывов недоступен.</h3>');
					}			
				});
				
			}); 
			
		},
		error: function(errorMsg) {
			$('.catalog__product_error').append('<h3>К сожалению каталог недоступен, попробуйте зайти позже</h3>');
		}
	}); 
	
/* --- Registration --- */	
	$('#register').on('click', function(event){
		event.preventDefault(); 
 		var username = $.trim($('#username').val()); 
		var pass = $.trim($('#password').val()); 
			if(username == "" || pass == "") {
				$('.authorization__prompt_error p').hide();
				$('#errorEmptyField').fadeIn();
				setTimeout(function(){
					$('#errorEmptyField').fadeOut();
				}, 5000);
			} else {
				$.ajax({
					url: http + 'api/register/',
					type: 'POST',   
					dataType: 'json', 
					data: {
						"username": username,
						"password": pass
					},
					success: function(data) {
						if(data.success == false) {
							$('.authorization__prompt_error p').hide();
							$('#errorUsername').fadeIn();
							setTimeout(function(){
								$('#errorUsername').fadeOut();
							}, 5000);
														
						} else {
							$('.authorization__prompt_error p').hide();
							$('.login-form').hide();
							$('#success').fadeIn();
							$('.form-text').text($('#username').val());
							token = data.token;
							console.log(token);
						}
					},
					error: function(errorMsg) {
						$('#errorRegistration').show();
						setTimeout(function(){
							$('#errorRegistration').hide();
						}, 5000);
					}
				});
			}
	});
	
	
	
/* --- Authorization --- */
	$('#login').on('click', function(event){  
		event.preventDefault();
		var username = $.trim($('#username').val()); 
		var pass = $.trim($('#password').val());
		
		if(username == "" || pass == "") {
			$('.authorization__prompt_error p').hide();
			$('#errorEmptyField').fadeIn();
			setTimeout(function(){
				$('#errorEmptyField').fadeOut();
			}, 5000);
		} else {
			$.ajax({
				url: http + 'api/login/',
				type: 'POST',   
				dataType: 'json', 
				data: {
					"username": username,
					"password": pass
				},
				success: function(data) {
					if(data.success == false) {
						$('.authorization__prompt_error p').hide();
						$('#errorPassword').fadeIn();
						setTimeout(function(){
							$('#errorPassword').fadeOut();
						}, 5000);
					} else {
						$('.login-form').hide();
						$('.authorization__prompt_error p').hide();
						$('#success').fadeIn();
						$('.form-text').text($('#username').val());	
						token = data.token;
					}	
				},
				error: function(errorMsg) {
					$('#errorRegistration').fadeIn();
					setTimeout(function(){
						$('#errorRegistration').fadeOut();
					}, 5000);
				}
			});
		}
	});
	

/* --- Add a comment --- */	
	$('.reviewForm__button').on('click', function(event){ 
		event.preventDefault(); 
		var text = $.trim($('#review').val()); 
		var rate = $('.rateStar').val(); 
		if(text == "") {
			$('.reviewForm__prompt_error p').hide();
			$('#emptyField').fadeIn();
			setTimeout(function(){
				$('#emptyField').fadeOut();
			}, 5000);
		} else {
			$.ajax({
				type: 'POST',  
				url: http + 'api/reviews/' + index,				
				dataType: 'json', 
				headers: {
					'Authorization': 'Token ' + token
				}, 
				data: {
					'rate': rate,
					'text': text
				},
				beforeSend: function(xhr){
					xhr.setRequestHeader('Authorization', 'Token ' + token);
					console.log('Token ' + token);
					console.log(index);
				}, 
				success: function(data) {
					$('.reviewForm__prompt_error p').hide();
					$('#msgSubmit').fadeIn();
					setTimeout(function(){
						$('#msgSubmit').fadeOut();
					}, 5000);
					
				/* --- Last a comment --- */		
					$.ajax({
						type: 'GET',  
						url: http + 'api/reviews/'  + index,				
						dataType: 'json', 
						success: function(data) {
							$('.comment-content').prepend('<div class="product-details"><p class="created">' + data[data.length - 1].created_by.username 
												 + ' <span class="time"> ' + data[data.length - 1].created_at + '</span></p><p class="rate">Rate: <span>' 
												 + data[data.length - 1].rate + '</span></p>' + '<p class="comment-text">Comment: <span>' 
												 + data[data.length - 1].text + '</span></p></div>');
							setTimeout("$('#review').val('')",500);
						}
					});

				},
				error: function(errorMsg) {
					if (token == undefined) {
						$('.reviewForm__prompt_error p').hide();
						$('#tokenUndefined').fadeIn();
						setTimeout(function(){
							$('#tokenUndefined').fadeOut();
						}, 5000);
					} else {
						$('.reviewForm__prompt_error p').hide();
						$('#errorMsgSubmit').fadeIn();
						setTimeout(function(){
							$('#errorMsgSubmit').fadeOut();
						}, 5000);
					}
				}
			});
		}
	});
	
});
