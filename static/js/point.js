var unlinkVisible = false;

function showAlert(alertHTML) {
    $('.topSpace').html($('<div class="alert"><button type="button" class="close" data-dismiss="alert">&times;</button>' + alertHTML + '</div>'));   
}


function toggleUnlink() {
	if ( unlinkVisible ) {
		$( ".navWhy" ).removeClass("ui-helper-hidden");
		$( ".navWhy" ).show();
		$( ".navWhy" ).button();
		$( ".unlinkbutton" ).addClass("ui-helper-hidden");
		$( ".ui-helper-hidden" ).hide();
		$("#unlinkToggle").html('<span class="ui-button-text">Unlink</span>');
		unlinkVisible = false;
	} else {
		$( ".navWhy" ).addClass("ui-helper-hidden");
		$( ".ui-helper-hidden" ).hide();
		$( ".unlinkbutton" ).removeClass("ui-helper-hidden");
		$( ".unlinkbutton" ).show();
		$( ".unlinkbutton" ).button();
		$("#unlinkToggle").html('<span class="ui-button-text">Done</span>');
		unlinkVisible = true;
	}
}

function callPointEdit(){
    if ($('#title_editPointDialog').val().length > MAX_TITLE_CHARS) {
        alert('Too many characters in the title');
        return;
    }
	var ed = tinyMCE.get('editor_editPointDialog');
    var text = tinyMCE.activeEditor.getBody().textContent;
    $("#submit_editPointDialog").off('click');
    $("#submit_editPointDialog").hide();
    $("#submit_editPointDialog").after("<img id=\"spinnerImage\" src=\"/static/img/ajax-loader.gif\"/>");
	$.ajaxSetup({
	   url: "/editPoint",
	   global: false,
	   type: "POST",
		 data: {
			'urlToEdit': pointURL,
			'content': ed.getContent(),
			'plainText':text.substring(0,250),
			'title': $('#title_editPointDialog').val(),
			'imageURL':$('#link_editPointDialog').val(),
            'imageAuthor':$('#author_editPointDialog').val(),
            'imageDescription': $('#description_editPointDialog').val()
			},
			success: function(data){
				var ed = tinyMCE.get('editor_editPointDialog');
			    obj = JSON.parse(data);
				$('.mainPointContent').html(ed.getContent());
				$('.mainPointTitle h1').html($('#title_editPointDialog').val());
				$('.mainPointVersion').html(obj.version);
				$('.mainPointAuthor').html(obj.author);
				$('.mainPointDateEdited').html(obj.dateEdited);
                if (obj.imageURL) {
                    $('.pointDisplay').attr('src', "//d3uk4hxxzbq81e.cloudfront.net/FullPoint-" + obj.imageURL)
                }
				$('.mainPointImageURL').html(obj.imageURL);
				$('.mainPointImageAuthor').html(obj.imageAuthor);
				$('.mainPointImageDescription').html(obj.imageDescription);
				$("#spinnerImage").remove();
				$("#submit_editPointDialog").show();
                $("#submit_editPointDialog").on('click', function(e) { callPointEdit();});                        		
				$("#editPointDialog").modal('hide');
				pointURL = obj.pointURL;
			},
     		error: function(xhr, textStatus, error){
                alert('The server returned an error. You may try again.');
                $("#spinnerImage").remove();
        		$("#submit_editPointDialog").on('click', function(e) { callPointEdit();});
                $("#submit_editPointDialog").show();                			    
            }
	 });
	$.ajax();

}

function supportingPointUnlink(supportingPointURL) {
	$.ajaxSetup({
	   url: "/unlinkPoint",
	   global: false,
	   type: "POST",
		 data: {
			'mainPointURL': pointURL,
			'supportingPointURL': supportingPointURL
			},
			success: function(data){
          obj = JSON.parse(data);
          if (obj.result == true) {
            $('#supportingPoint_' + obj.pointURL).remove();
            if ($("[id^=supportingPoint_]").length == 0 ) {
              $("#zeroSupportingPoints").show();
              $("#nonzeroSupportingPoints").hide();
              $( "[name=linkSupportingPoint]" ).button();
            }
          } else {
            alert(obj.result);
          }
        }
    });
	$.ajax();
}
		
function upVoteToggle(turnOn) {
    if (turnOn) {
        $( "#upVote").removeClass("inactiveVote");
        $( "#upVote").addClass("greenVote");
    } else {
        $( "#upVote").removeClass("greenVote");
        $( "#upVote").addClass("inactiveVote");
    }
}
	      
function downVoteToggle(turnOn) {
    if (turnOn) {
        $( "#downVote").removeClass("inactiveVote");
        $( "#downVote").addClass("redVote");
    } else {
        $( "#downVote").removeClass("redVote");
        $( "#downVote").addClass("inactiveVote");
    }
}

function updateVoteButtonLabels(newVote){
    var downvoteLabel = $( "#downVote a" ).text();
    var upvoteLabel = $( "#upVote a" ).text();
    var bigScore = $( "#bigScore" ).text();

    if (myVote == 0 && newVote == 1) {// UPVOTE
        var newVal = parseInt(upvoteLabel) + 1;
        $( "#upVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) + 1);
        upVoteToggle(true);
    } else if (myVote == 0 && newVote == -1) { // DOWNVOTE
        var newVal = parseInt(downvoteLabel) + 1;
        $( "#downVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) - 1);
        downVoteToggle(true);
    } else if (myVote == 1  &&  newVote == 0) { // CANCEL UPVOTE
        var newVal = parseInt(upvoteLabel) - 1;
        $( "#upVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) - 1);
        upVoteToggle(false);
    } else if (myVote == -1  &&  newVote == 0) { // CANCEL DOWNVOTE
        var newVal = parseInt(downvoteLabel) - 1;
        $( "#downVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) + 1);
        downVoteToggle(false);
    } else if (myVote == -1  &&  newVote == 1) { // DOWN TO UP
        var newVal = parseInt(downvoteLabel) - 1;
        $( "#downVote a" ).text(newVal.toString());
        var newVal = parseInt(upvoteLabel) + 1;
        $( "#upVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) + 2);
        downVoteToggle(false);
        upVoteToggle(true);
    } else if (myVote == 1  &&  newVote == -1) {// UP TO DOWN
        var newVal = parseInt(downvoteLabel) + 1;
        $( "#downVote a" ).text(newVal.toString());
        var newVal = parseInt(upvoteLabel) - 1;
        $( "#upVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) - 2);
        upVoteToggle(false);
        downVoteToggle(true);
    }
    myVote = newVote;
}

function upVote() {
    $.ajaxSetup({
       url: "/vote",
       global: false,
       type: "POST",
       data: {
    		'vote': myVote == 1 ? 0 : 1,
    		'pointURL': pointURL
    		},
       success: function(data){
            obj = JSON.parse(data);
            if (obj.result == true) {
            updateVoteButtonLabels(obj.newVote);
            } else {
            alert('An error happened and your vote may not have counted. Try a page refresh?');
            }
        }
    });
    $.ajax();
}

function downVote() {
    $.ajaxSetup({
        url: "/vote",
        global: false,
        type: "POST",
        data: {
    		'vote': myVote == -1 ? 0 : -1,
    		'pointURL': pointURL
    		},
        success: function(data){
            obj = JSON.parse(data);
            if (obj.result == true) {
              updateVoteButtonLabels(obj.newVote);
            } else {
              alert('An error happened and your vote may not have counted. Try a page refresh?');
            }
        }
    });
    $.ajax();
}

function deletePoint(urlToDelete) {
    $.ajaxSetup({
        url: "/deletePoint",
        global: false,
        type: "POST",
        data: {
            'urlToDelete': urlToDelete
            },
        success: function(data){
            obj = JSON.parse(data);
            if (obj.result == true) {
            			  alert('Deleted point ' + obj.deletedURL);
            			  window.location = "/";
            } else {
            alert(obj.error);
            }
    	},
        error: function (xhr, ajaxOptions, thrownError) {
            alert('ERROR:' + xhr.status);
            alert(thrownError);
        }
    });
    $.ajax();
}

function make_this_show_login_dlg(button) {
    button.attr('href',"#loginDialog");
    button.attr('data-toggle',"modal");
}

function populateEditFields() {
  var ed = tinyMCE.get('editor_editPointDialog');

  $('#title_editPointDialog').val($('#pointSummary div.mainPointTitle').text());
  setCharNumText($('#title_editPointDialog')[0]);
  if (ed) {
	  ed.setContent($('#pointSummary .mainPointContent').html() );
	}
	$('#author_editPointDialog').val($('#pointSummary div.mainPointImageAuthor').text());
  $('#description_editPointDialog').val($('#pointSummary div.mainPointImageDescription').text());
  var url = $('#pointSummary div.mainPointImageURL').text();

  $('#link_editPointDialog').val(url);
  if(url !== '') {
    if(url.match("https?://")) {
      $('#editPointDialog .filepicker-placeholder').attr('src', url);
    } else {
      $('#editPointDialog .filepicker-placeholder').attr('src', '//d3uk4hxxzbq81e.cloudfront.net/SummaryMedium-'+url);
    }
  }

}

function toggleTabbedArea(selectedTab, tabbedAreaToShow) {
	$('.tab').removeClass('selectedTab');
	$(selectedTab).addClass('selectedTab');
	$('.tabbedArea').hide();
	$(tabbedAreaToShow).show();
}

function selectPoint(supportingPointURL, currentPointURL){
  	$.ajaxSetup({
		url: "/linkPoint",
		global: false,
		type: "POST",
	 	data: {
			'supportingPointURL': supportingPointURL,
			'parentPointURL': currentPointURL
			},
		success: function(data){
		  obj = JSON.parse(data);
		  if (obj.result == true) {
			window.location.href="/point/" + currentPointURL;
		  } else {
		  	if (obj.error) {
		  	    showAlert('<strong>Oops!</strong> There was an error: ' + obj.error);
		    } else {
		        showAlert('<strong>Oops!</strong> There was an error: ');
		    }
		  }
		}
	});
	$.ajax();
}


function addPoint(){
    if ($('#title_createSupportingPoint').val().length > MAX_TITLE_CHARS) {
        alert('Too many characters in the title');
        return;
    }
	var ed = tinyMCE.get('editor_createSupportingPoint');
    var text = tinyMCE.activeEditor.getBody().textContent;
    $("#submit_createSupportingPoint").off('click');
    $("#submit_createSupportingPoint").hide();
    $("#submit_createSupportingPoint").after("<img id=\"spinnerImage\" src=\"/static/img/ajax-loader.gif\"/>");
	$.ajaxSetup({
		url: "/addSupportingPoint",
		global: false,
		type: "POST",
		data: {
			'content': ed.getContent(),
            'plainText': text.substring(0,500),
			'title': $('#title_createSupportingPoint').val(),
			'pointUrl': pointURL,
			'imageURL':$('#link_createSupportingPoint').val(),
            'imageAuthor':$('#author_createSupportingPoint').val(),
            'imageDescription': $('#description_createSupportingPoint').val()
		},
		success: function(data){
			obj = JSON.parse(data);
			if (obj.result == true) {
			    window.location.href="/point/" + pointURL;
			} else {
				if (obj.error) {
		    		showAlert(obj.error);
		    	} else {
		    		showAlert("There was an error");
		    	}
                $("#spinnerImage").remove();
			    $("#submit_createSupportingPoint").on('click', function(e){addPoint();}); 
			    $("#submit_createSupportingPoint").show();
			}
		},
		error: function(xhr, textStatus, error){
            showAlert('The server returned an error. You may try again.');
            $("#spinnerImage").remove();
            $("#submit_createSupportingPoint").on('click', function(e){addPoint();}); 
            $("#submit_createSupportingPoint").show();                			    
        } 			
	});
	$.ajax();
}

function displaySearchResults(data){
	$("[id^=searchPoint]",$(".searchColumn")).remove();
	obj = JSON.parse(data);
	if (obj.result == true) {
		appendAfter = $(".searchColumn");
		for(var i=0; i < obj.searchResults.length; i++){						    
			var oneResult = obj.searchResults[i];
			// we need to create 4 divs
			// 1. a row-fluid
			mainRowDiv = $('<div/>', { class:"row-fluid", id:"searchPoint_"+oneResult['url']});							
			// 2. the popout
			popOutDiv = $('<div/>', {class:"span1 noRightChannel"});
			popOutDiv.html("<a id=\"popoutPoint_" + oneResult['url'] +
			                "\" data-pointurl=\""+ oneResult['url']  +
			                "\" data-pointtitle=\"" + oneResult['title'] + "\" ></a>");                            
			// 3. the select supporting point div
			if (oneResult['voteTotal'] >= thresholdGreen ) {spanClass = 'green'; } 
			else if  (oneResult['voteTotal'] <= thresholdRed) { spanClass = 'red'; } 
			else {  spanClass = 'yellow'; }
			selectDiv = jQuery('<div/>', {
				class: "pointSmall span11 " + spanClass,
				id: "selectPoint_div_search_" +  oneResult['url'],
				alt: "Use " + oneResult['url']								
				});
			selectDiv.data('pointurl', oneResult['url']);
			// 4. and, inside it, the score and title div and the arrow div
			titleDiv = jQuery('<div/>',{class:"span10 title"} );
			titleDiv.html("<h5><span class=\"score\">" + oneResult['voteTotal'] + 
			              "</span> <a href=\"#\" > " + oneResult['title'] + "</a></H5>");
			buttonDiv= jQuery('<div/>',{class:"span2"} );
            buttonDiv.html("<a class=\"pull-right\" href=\"#\"id=\"selectPoint_arrow_" + 
                            oneResult['url'] + "\"alt=\"Use " + oneResult['title'] + "\" ></a>");
            selectDiv.append(titleDiv);selectDiv.append(buttonDiv);
            mainRowDiv.append(popOutDiv);mainRowDiv.append(selectDiv);							
			appendAfter.append(mainRowDiv);mainRowDiv.show();
    	}
        setUpSelectPointButtons();
        setUpPopoutButtons();
	} else {
		alert('There were no results for: ' + $(".searchBox").val() + ' or that is already a supporting point');
	}
}

function setUpSelectPointButtons() {
    $("[id^=selectPoint_div_]").on('click', function(e){
        var theLink = $(this);
        selectPoint(theLink.data('pointurl'), pointURL );
    });
}

function setUpPopoutButtons() {
    $("[id^=popoutPoint_]").on('click', function(e){
        var theLink = $(this);
        window.open( "/point/" + theLink.data('pointurl'),theLink.data('pointtitle') , "height=800,width=1000");
    }); 
}

$(document).ready(function() {
    //$( "[name=linkSupportingPoint]" ).button();
    $('[id^="supportingPoint_"]').click(function() {
        if (!$(".navWhy", $(this)).hasClass("ui-helper-hidden")) { // The navWhy is sometimes hidden by the unlink button
          window.location.href = $(".navWhy", $(this)).attr('href');
        }
    });

    if (!loggedIn) {
        $( "[name=linkSupportingPoint]" ).attr('href',"#loginDialog");
        $( "[name=linkSupportingPoint]" ).attr('data-toggle',"modal");
        make_this_show_login_dlg($( "#unlinkToggle" ));
        make_this_show_login_dlg($( "#editPoint" ));
        make_this_show_login_dlg($( "#upVote" ));
        make_this_show_login_dlg($( "#downVote" ));
        make_this_show_login_dlg($( "#viewPointHistory" ));
    } else {
        /*$( "[name=linkSupportingPoint]" ).click(function() {
          var params = [];
          params["parentPointURL"] = pointURL;
          post_to_url("/selectSupportingPoint", params);
        });*/

        $( "#unlinkToggle" )
        			.button()
        			.click(function() {
        				toggleUnlink();
        			});

        $( "#editPoint" ).attr('href',"#editPointDialog");
        $( "#editPoint" ).attr('data-toggle',"modal");
        $( "#editPoint" ).on('click', function() {
          populateEditFields();
          $('#frm_editPointDialog .filepicker').bindFilepicker();
        });

        $("#submit_editPointDialog").on('click', function(e) { callPointEdit();});

        	$( "#upVote" ).click(function() {upVote();});
        		//$('#upVote').button({ icons: {primary: 'ui-icon-up', secondary: null}});

        	$( "#downVote" ).click(function() {
        		downVote();
        	});
	
        $("[id^=selectPoint_menu_]").on('click', function(e){
            var theLink = $(this);
            selectPoint(theLink.data('pointurl'), pointURL );
        });
        
        $( "#createSupportingPointLink" ).attr('href',"#createSupportingPoint");
        $( "#createSupportingPointLink" ).attr('data-toggle',"modal");   
        $("#submit_createSupportingPoint").on('click', function(e){addPoint();});
        
        $( "#searchForSupportingPoint" ).attr('href',"#supportingPointSearch");
        $( "#searchForSupportingPoint" ).attr('data-toggle',"modal");        
            
        $('#searchForSupportingPoint').on('hidden', function () {
            $("[id^=searchPoint]",$(".searchColumn")).remove();        	
        })
        $("#selectSupportingPointSearch").keyup(function(event){
    		if(event.keyCode == 13){
    			$.ajaxSetup({
    				url: "/ajaxSearch",
    				global: false,
    				type: "POST",
    				data: {
    					'searchTerms': $(".searchBox").val(),
    					'exclude' : pointURL
    				},
    				success: function(data) {displaySearchResults(data);},
    			});
    			$.ajax();
    	    }
        });
    }
        
    $( ".whybutton" ).button();
    $( ".unlinkbutton" ).button();
    $( ".unlinkbutton" ).addClass("ui-helper-hidden");
    $( ".ui-helper-hidden" ).hide();
    $( "#deletePoint" ).button();

    // Beginning state
    $('.tabbedArea').hide(); $('#supportingPointsArea').show();

    $('#viewSupportingPoints').click(function() {
    toggleTabbedArea(this, "#supportingPointsArea");
    });

    $('#viewComments').click(function() {
      toggleTabbedArea(this, "#disqus_thread");
    });

    $('#viewPointHistory').click(function() {
    	$('#historyArea').html('<div id="historyAreaLoadingSpinner"><img src="/static/img/ajax-loader.gif" /></div>');
    	toggleTabbedArea(this, "#historyArea");
    	$.ajax({
    		url: '/pointHistory',
    		type: 'GET',
    		data: { 'pointUrl': pointURL },
    		success: function(data) {
    			$('#historyArea').empty();
    			$('#historyArea').html($.parseJSON(data));
    		},
    		error: function(data) {
    			$('#historyArea').empty();
    			showAlert('<strong>Oops!</strong> There was a problem loading the point history.  Please try again later.');
    		},
    	});
    });

});
