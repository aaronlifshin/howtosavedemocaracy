

function searchDialogAlert(alertHTML) {
    $('#linkedPointSearchDialog #alertArea').html($('<div class="alert"><button type="button" class="close" data-dismiss="alert">&times;</button>' + alertHTML + '</div>'));
}

function toggleUnlink(elem, linkType) {
    
    unlinkVisible = $(elem).text() == 'Cancel';   
    nodetype = $(elem).data('nodetype');
	if ( unlinkVisible ) {
	    // Hiding the unlink controls
	    $(elem).text('Unlink');
	    $(".unlinkbutton", $('#' + linkType + '_pointList')).remove();
        $( ".pointCard" ).unbind('mouseenter');
        $( ".pointCard" ).unbind('mouseleave');    
        makePointsCardsClickable();
            	    
	} else {	    
	    // Find all the point cards underneath my link type
	    pointCards = $('.pointCard', $('#' + linkType + '_pointList'))	    
	    // Put the element on them each
	    pointCards.hover(
            function() {
                $(this).append(    
        	        "<div class='unlinkbutton'><a href='javascript:;' onclick='javascript:pointUnlink(this, \""+ 
        	        linkType +"\", \""+ nodetype +"\")' alt='Unlink " + linkType + " Point'>Unlink This</a></div>" );
            },
            function() {
                $(this).find('.unlinkbutton').remove();
            }
        );
	    pointCards.unbind('click');
	    $(elem).text('Cancel');
	}
}

function callPointEdit(){
    if ($('#title_pointDialog').val().length > MAX_TITLE_CHARS) {
        editDialogAlert('Please do not exceed 140 characters for the title.');
        return;
    }
    if ($('#title_pointDialog').val().length == "") {
        editDialogAlert('To create a point you must enter something for the title!');      
        return;
    }
	var ed = tinyMCE.get('editor_pointDialog');
    var text = tinyMCE.activeEditor.getBody().textContent;
    $("#submit_pointDialog").off('click');
    $("#submit_pointDialog").hide();
    $("#submit_pointDialog").after("<img id=\"spinnerImage\" src=\"/static/img/ajax-loader.gif\"/>");
	$.ajaxSetup({
	   url: "/editPoint",
	   global: false,
	   type: "POST",
		 data: {
			'urlToEdit': pointURL,
			'content': ed.getContent(),
			'plainText':text.substring(0,250),
			'title': $('#title_pointDialog').val(),
			'imageURL':$('#link_pointDialog').val(),
            'imageAuthor':$('#author_pointDialog').val(),
            'imageDescription': $('#description_pointDialog').val(),
            'sourcesURLs': JSON.stringify(getNewSourcesURLs()),
            'sourcesNames': JSON.stringify(getNewSourcesNames()),
            'sourcesToRemove': JSON.stringify($('#pointDialog').data('sourcesToRemove'))
			},
			success: function(data){
				var ed = tinyMCE.get('editor_pointDialog');
			    obj = JSON.parse(data);
				$('.mainPointContent').html(ed.getContent());
				$('.mainPointTitle').html($('#title_pointDialog').val());
				$('.mainPointLastEdited').html('Last edited ' + obj.dateEdited + 
				    ' by <a href=\'/user/' + obj.authorURL +'\'>'+ obj.author + '</a>');
                if (obj.imageURL) {
                    $('.pointDisplay').attr('src', "//d3uk4hxxzbq81e.cloudfront.net/FullPoint-" + encodeURIComponent(obj.imageURL))
                }
				$('.mainPointImageURL').html(obj.imageURL);
				$('.mainPointImageAuthor').html(obj.imageAuthor);
				$('.mainPointImageCaption').html(obj.imageDescription);
				$('#mainPointSources').remove();
				$('[name=mainPointSource]').remove();				
				$('.mainPointImageURL').after(obj.sourcesHTML);
				
            	stopSpinner();
				$("#pointDialog").modal('hide');
				pointURL = obj.pointURL;
			},
     		error: function(xhr, textStatus, error){
                alert('The server returned an error. You may try again.');
            	stopSpinner();
            }
	 });
	$.ajax();

}

function pointUnlink(elem, linkType, nodetype) {
    startSpinnerOnButton('.unlinkbutton a');
    $( ".pointCard" ).unbind('mouseenter');
    $( ".pointCard" ).unbind('mouseleave');
    
    pointCard = $(elem).parent().parent();
    supportingPointURL = pointCard.data('pointurl');
	$.ajaxSetup({
	   url: "/unlinkPoint",
	   global: false,
	   type: "POST",
		 data: {
			'mainPointURL': pointURL,
			'supportingPointURL': supportingPointURL,
			'linkType': linkType
			},
			success: function(data){
              obj = JSON.parse(data);
              if (obj.result == true) {
                pointCard.remove();
                if ($('.pointCard', $('#' + linkType + '_pointList')).length == 0 ) {
                    $("#" + linkType + "_zeroPoints").show();
                    $("#" + linkType + "_nonzeroPoints").hide();
                    $("[name=" + linkType + "_linkPoint]").button();
                } else {
                    setPointListHeader(linkType, nodetype);
                }
              } else {
                showErrorAlert('There was an error during unlinking'); // UNlink doesn't return error messages at this time
              }
              toggleUnlink($('#' + linkType + '_unlinkToggle'), linkType);              
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

	// Numbers are currently not displayed
    if (myVote == 0 && newVote == 1) {// UPVOTE
        // var newVal = parseInt(upvoteLabel) + 1;
        // $( "#upVote a" ).text(newVal.toString());
        // $( "#bigScore" ).text(parseInt(bigScore) + 1);
        // $("#voteLabel").text("You agree");
        upVoteToggle(true);
    } else if (myVote == 0 && newVote == -1) { // DOWNVOTE
        // var newVal = parseInt(downvoteLabel) + 1;
        // $( "#downVote a" ).text(newVal.toString());
        // $( "#bigScore" ).text(parseInt(bigScore) - 1);
        // $("#voteLabel").text("You disagree");        
        downVoteToggle(true);
    } else if (myVote == 1  &&  newVote == 0) { // CANCEL UPVOTE
        // var newVal = parseInt(upvoteLabel) - 1;
        // $( "#upVote a" ).text(newVal.toString());
        // $( "#bigScore" ).text(parseInt(bigScore) - 1);
        // $("#voteLabel").text("You abstain");                
        upVoteToggle(false);
    } else if (myVote == -1  &&  newVote == 0) { // CANCEL DOWNVOTE
        // var newVal = parseInt(downvoteLabel) - 1;
        // $( "#downVote a" ).text(newVal.toString());
        // $( "#bigScore" ).text(parseInt(bigScore) + 1);
        // $("#voteLabel").text("You abstain");                
        downVoteToggle(false);
    } else if (myVote == -1  &&  newVote == 1) { // DOWN TO UP
        // var newVal = parseInt(downvoteLabel) - 1;
        // $( "#downVote a" ).text(newVal.toString());
        // var newVal = parseInt(upvoteLabel) + 1;
        // $( "#upVote a" ).text(newVal.toString());
        // $( "#bigScore" ).text(parseInt(bigScore) + 2);
        // $("#voteLabel").text("You agree");        
        downVoteToggle(false);
        upVoteToggle(true);
    } else if (myVote == 1  &&  newVote == -1) {// UP TO DOWN
        var newVal = parseInt(downvoteLabel) + 1;
        // $( "#downVote a" ).text(newVal.toString());
        // var newVal = parseInt(upvoteLabel) - 1;
        // $( "#upVote a" ).text(newVal.toString());
        // $( "#bigScore" ).text(parseInt(bigScore) - 2);
        $("#voteLabel").text("You disagree");                
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

function changeRibbon() {
    var newRibbonValue = !$("#blueRibbon").data("ribbonvalue"); // "false" -> true
    $.ajaxSetup({
        url: "/setribbon",
        global: false,
        type: "POST",
        data: {
    		'pointURL': pointURL,
    		'ribbon':newRibbonValue
    		},
        success: function(data){
            obj = JSON.parse(data);
            if (obj.result == true) {
              updateRibbon(newRibbonValue, obj.ribbonTotal);
            } else {
              alert('An error happened and your award may not have counted. Try after a page refresh?');
            }
        }
    });
    $.ajax();
}

function updateRibbon(newRibbonValue, ribbonTotal) {
    $("#blueRibbon").data("ribbonvalue", newRibbonValue);
    if (newRibbonValue) {
        $("#blueRibbon a").removeClass("notAwarded");   
        $("#blueRibbon a").removeClass("hover");  
        $("#blueRibbon a").addClass("awarded");                     
    } else {
        $("#blueRibbon a").removeClass("hover");                
        $("#blueRibbon a").removeClass("awarded");
        $("#blueRibbon a").addClass("notAwarded");        
    }
    $("#ribbonTotal").text(ribbonTotal);
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
  var ed = tinyMCE.get('editor_pointDialog');
  var nodetype = $('#pointSummary').data('nodetype')  
  $('div.modal-header h3', $('#pointDialog')).text("Edit " + nodetype);

  $('#title_pointDialog').val($('#pointSummary div.mainPointTitle').text());
  setCharNumText($('#title_pointDialog')[0]);
  if (ed) {
    ed.setContent($('#pointSummary .mainPointContent').html() );
  }
  $('#author_pointDialog').val($('#mainPointImageArea .mainPointImageAuthor').text());
  $('#description_pointDialog').val($('#mainPointImageArea .mainPointImageCaption').text());
  var url = $('#pointSummary div.mainPointImageURL').text();
  $('#link_pointDialog').val(url);
  
  $('[name=mainPointSource] a').each(function(i, obj) {    
      var sourcekey = $(obj).data('sourcekey');
      addSourceHTML($(obj).attr('href'), $(obj).text(), sourcekey);
  });

  if(url !== '') {
    if(url.match("https?://")) {
      $('.filepicker-placeholder').attr('src', url);
    } else {
      $('.filepicker-placeholder').attr('src', '//d3uk4hxxzbq81e.cloudfront.net/SummaryMedium-'+encodeURIComponent(url));
    }
  }

}

function selectPoint(supportingPointURL, currentPointURL, linkType, nodetype){

  	$.ajaxSetup({
		url: "/linkPoint",
		global: false,
		type: "POST",
	 	data: {
			'supportingPointURL': supportingPointURL,
			'parentPointURL': currentPointURL,
			'linkType': linkType,
			},
		success: function(data){
		  obj = JSON.parse(data);
		  if (obj.result == true) {
              pointListAppend(linkType, obj.newLinkPoint, obj.numLinkPoints, nodetype);
		  } else {
            if (obj.error) {
                showAlert('<strong>Oops!</strong> There was an error: ' + obj.error);
            } else {
                showAlert('<strong>Oops!</strong> There was an error: ');
            }
		  }
          $("#linkedPointSearchDialog").modal('hide');
		},
		error: function(xhr, textStatus, error){
            showAlert('The server returned an error. You may try again.');
            $("#linkedPointSearchDialog").modal('hide');
        }
	});
	$.ajax();
}

function setPointListHeader(linkType, nodeType) {
    numLinkPoints = $("#" + linkType + ("_pointList")).children().length - 1;
    linkName = linkType == 'child' ? 'Related' : linkType.capitalize();
    if (numLinkPoints == 0) {
        header = "Zero " + linkName + " " + nodeType + "s";
    } else {
        header = numLinkPoints + " " +  linkName +  " " + nodeType + (numLinkPoints == 1 ? "":"s");
    }
    $("#"+linkType+"_numberOfPoints").text( header );
}

function pointListAppend(linkType, pointHTML, numLinkPoints, nodeType) {
    if ($("[id^=" + linkType +"Point_]").length == 0 ) {
      $("#" + linkType + "_zeroPoints").hide();
      $("#" + linkType + "_nonzeroPoints").show();
    }

    parent = $("#" + linkType + "_pointList");
    parent.append($.parseJSON(pointHTML));
    setPointListHeader(linkType, nodeType);
    makePointsCardsClickable();	    
    var newElem = parent.find('>:last-child');
    var position = newElem.offset();
    $("html, body").animate({ scrollTop: position.top - newElem.height()}, "slow");
    
}


function addPoint(linkType, nodeType){
    unlinkVisible = !$("[id^=unlink_" + linkType + "]").hasClass("ui-helper-hidden");
    if (unlinkVisible) toggleUnlink(linkType);

    var dialogID = "#pointDialog"
    if ($('#title_pointDialog').val().length > MAX_TITLE_CHARS) {
        editDialogAlert('Please do not exceed 140 characters for the title.');
        return;
    }
    if ($('#title_pointDialog').val().length == "") {
        editDialogAlert('To create a point you must enter something for the title!');      
        return;
    }
	var ed = tinyMCE.get('editor_pointDialog');
    var text = tinyMCE.activeEditor.getBody().textContent;
    $('#submit_pointDialog').off('click');
    $('#submit_pointDialog').hide();
    $('#submit_pointDialog').after("<img id=\"spinnerImage\" src=\"/static/img/ajax-loader.gif\"/>");
    
    
	$.ajaxSetup({
		url: "/addSupportingPoint",
		global: false,
		type: "POST",
		data: {
			'content': ed.getContent(),
            'plainText': text.substring(0,500),
			'title': $('#title_pointDialog').val(),
			'linkType':linkType,
			'nodeType':nodeType,
			'pointUrl': pointURL,
			'imageURL':$('#link_pointDialog').val(),
            'imageAuthor':$('#author_pointDialog').val(),
            'imageDescription': $('#description_pointDialog').val(),
            'sourcesURLs': JSON.stringify(getNewSourcesURLs()),
            'sourcesNames': JSON.stringify(getNewSourcesNames())
		},
		success: function(data){
			obj = JSON.parse(data);
			if (obj.result == true) {
                pointListAppend(linkType, obj.newLinkPoint, obj.numLinkPoints, nodeType);
                stopSpinner();
    		    $(dialogID).modal('hide');
			} else {
				if (obj.error) {
		    		editDialogAlert(obj.error);
		    	} else {
		    		editDialogAlert("There was an error");
		    	}
                stopSpinner();
			}
		},
		error: function(xhr, textStatus, error){
            editDialogAlert('The server returned an error: ' + str(error) + ' You may try again.');
            stopSpinner();
        }
	});
	$.ajax();
}

function linkPointControlsInitialState() {
    $( ".whybutton" ).button();
    $( ".unlinkbutton" ).button();
    $( ".unlinkbutton" ).addClass("ui-helper-hidden");
    $( ".ui-helper-hidden" ).hide();
}


function displaySearchResults(data, linkType){
	$("#searchResultsArea").children().remove();
		
	obj = JSON.parse(data);
	
	if (obj.result == true) {
		appendAfter = $("#searchResultsArea");
		appendAfter.append("<div class='row-fluid' id='pointSelectText'>Select a point to link</div>" );		
		appendAfter.append(obj.resultsHTML);
        setUpSelectPointButtons();
        setUpPopoutButtons();
	} else {
		searchDialogAlert('There were no results for: ' + $(".searchBox").val() + ' or that is already a linked point');
	}
}

function selectSearchLinkPoint(elem, linktype) {
    pointCards = $('.pointCard', $('#searchResultsArea'));    
    pointCards.unbind('click');
    startSpinnerOnButton('#pointSelectText');    
    selectPoint($(elem).data('pointurl'), pointURL, linktype);  
}

function setUpSelectPointButtons() {
    pointCards = $('.pointCard', $('#searchResultsArea'))
    linktype = $("#selectLinkedPointSearch").data("linkType");
    nodetype = $("#selectLinkedPointSearch").data("nodetype");    
    pointCards.click( function() {
        selectSearchLinkPoint(this, linktype);
    });
    /*   
    pointCards.hover(
        function() {
            $(this).append(    
                "<div class='btn btn-primary searchLinkSelectButton'><a href='javascript:;' onclick='javascript:selectSearchLinkPoint(this, \""+ 
                linktype +"\")' alt='Select this Point'>Link This Point</a></div>" );
        },
        function() {
            $(this).find('.searchLinkSelectButton').remove();
        }
    ); 
    */   
}

function popoutPoint(elem) {
    window.open($(elem).parent().data('pointurl'), "_blank"); //"height=800,width=1000");
}

function setUpPopoutButtons() {    
    linktype = $("#selectLinkedPointSearch").data("linkType");
        	    
    pointCards.append(    
        "<a class='popoutPoint' href='javascript:;' onclick='javascript:popoutPoint(this)' alt='Select this Point'></a>" );
        
}


function setUpLinkedPointListControls() {
    // Areas inside the supporting point lists
    // These click events are in the "ys" namespace
    // We make sure to remove any .ys events off the controls before adding them
    // Dropdown add of the recently viewed points
    $("[name^=selectPoint_menu_]").off('.ys').on('click.ys', function(e){
        var theLink = $(this);
        var linkPointURL = theLink.data('pointurl');
        selectPoint(linkPointURL, pointURL, theLink.data('linktype'), $(this).data("nodetype"));
        $("[name^=selectPoint_menu_]").filter("*[data-pointurl=\""+ linkPointURL + "\"]").remove();
    });

    // Create a new linked point
    $( "[name=createLinked]" ).off('.ys').on('click.ys', function() {
        var linkType = $(this).data('linktype');
        $("#submit_pointDialog").data("dialogaction", "createLinked");
        $("#submit_pointDialog").data("linktype", linkType);
        if (linkType != 'child') {
            $("#submit_pointDialog").data("nodetype", "Point");            
        } else {
            $("#submit_pointDialog").data("nodetype", $(this).data("nodetype"));
        }
        var dialogName = "Create " + linkType.capitalize() + " Point";
        $('div.modal-header h3', $('#pointDialog')).text(dialogName);
        $("#pointDialog").modal('show');
    });
    
    // Show the search dialog
    $( "[name$=_searchForPoint]" ).off('.ys').on('click.ys', function(e){
        linkType = $(this).data('linktype');
        $("#selectLinkedPointSearch").data("linkType", linkType);
        if (linkType == "child") {
            nodetype = $(this).data("nodetype")
            $("#selectLinkedPointSearch").data("nodetype", nodetype);  
            $("#linkedPointSearchDialog .modal-header h3").text('Search for ' + nodetype + 's related to:');                           
        } else {
            $("#linkedPointSearchDialog .modal-header h3").text('Search for ' + linkType + ' points for:');                 
        }
        $('#linkedPointSearchDialog #alertArea').empty();   
        $("#linkedPointSearchDialog").modal('show');
    });
}


function setUpMenuAreas() {

    // Edit the current point
    $( "#editPoint" ).on('click', function() {
        populateEditFields();
        $("#submit_pointDialog").data("dialogaction", "edit")
        $("#pointDialog").modal('show');
    });
    
    $( "#addImage" ).on('click', function() {
        populateEditFields();
        $("#submit_pointDialog").data("dialogaction", "edit")
        $("#pointDialog").modal('show');
    });
    
    $( "#changeImage" ).on('click', function() {
        populateEditFields();
        $("#submit_pointDialog").data("dialogaction", "edit")
        $("#pointDialog").modal('show');
    });

    setUpLinkedPointListControls();

}

function makeLinkedPointsClickable() {
    $('[id^="supportingPoint_"]').click(function() {
        if (!$(".navWhy", $(this)).hasClass("ui-helper-hidden")) { // The navWhy is sometimes hidden by the unlink button
          window.location.href = $(".navWhy", $(this)).attr('href');
        }
    });

    $('[id^="counterPoint_"]').click(function() {
        if (!$(".navWhy", $(this)).hasClass("ui-helper-hidden")) { // The navWhy is sometimes hidden by the unlink button
          window.location.href = $(".navWhy", $(this)).attr('href');
        }
    });
}

function setCommentCount() {
    numComments = $(".cmmnt").length;    
    $('#commentCount').text(numComments + " comment" + (numComments == 1? "":"s"));
}

function insertComment(commentObj) {
    html = "<div class=\"row-fluid cmmnt level" + commentObj.level + "\">" +
      "<div class=\"cmmnt-content span11\">" + commentObj.text + "<a href=\"/user/"+  commentObj.userURL +
      "\" class=\"userlink\">" + commentObj.userName + "</a> - <span class=\"pubdate\">"  + commentObj.date + 
      "</span> </div> <div class=\"span1\">" +
          "<a name=\"commentReply\" data-parentkey="+ commentObj.myUrlSafe + ">Reply</a></div></li>"
          
    if (!commentObj.parentUrlsafe || commentObj.parentUrlsafe == '') {
        $('#comments').prepend(html);        
    } else {
        linkToInsertBelow = $("a[data-parentkey=\"" + commentObj.parentUrlsafe + "\"]");
        linkToInsertBelow.parent().parent().after(html);
    }
    
    $("[name=commentReply]").unbind("click", showReplyComment);    
    $("[name=commentReply]").on("click", showReplyComment);
    setCommentCount();
}

function showReplyComment(event) {
    $('#addComment').removeClass('hide');
    tinyMCE.execCommand('mceRemoveControl', false, 'commentText');
    $("#addComment").insertAfter($(event.target).parent().parent());
    initTinyMCE();
    $("#addComment").data('parentkey', $(event.target).data('parentkey'));
    $('body, html').animate({ scrollTop: $("#addComment table").offset().top - 100 }, 500);
    $('#showAddComment').parent().removeClass('hide');    
}

function saveComment(event) {
    var ed = tinyMCE.get('commentText');
    commentText = ed.getContent();    
    if (commentText.trim() == '') return;
    
    startSpinnerOnButton('#saveCommentSubmit');    
    $.ajaxSetup({
		url: "/saveComment",
		global: false,
		type: "POST",
		data: {
		    'commentText': ed.getContent(),
        	'p':$('#rootUrlSafe').val(),
        	'parentKey': $('#addComment').data('parentkey')
		},
		success: function(data){
			obj = JSON.parse(data);
			if (obj.result == true) {
                insertComment(obj);
                ed.setContent('');                                              
                stopSpinnerOnButton('#saveCommentSubmit', saveComment);
                $('#addComment').addClass('hide');  
                $('#addComment').data('parentkey', '');
			} else {
			    showAlertAfter(obj.error ? obj.error: "There was an error", "#addComment");
                stopSpinnerOnButton('#saveCommentSubmit', saveComment);
			}
		},
		error: function(xhr, textStatus, error){
            showAlertAfter('The server returned an error. You may try again.', "#addComment");
            stopSpinnerOnButton('#saveCommentSubmit', saveComment);
        }
	});
	$.ajax();
    
}


function searchDialogSearch() {
    startSpinnerOnButton('#submitLinkedPointSearch');
   
	$.ajaxSetup({
		url: "/ajaxSearch",
		global: false,
		type: "POST",
		data: {
			'searchTerms': $(".searchBox").val(),
			'exclude' : pointURL,
			'linkType' : $("#selectLinkedPointSearch").data("linkType"),
			'nodetype' : $("#selectLinkedPointSearch").data("nodetype")
		},
		success: function(data) {
		    displaySearchResults(data, $("#selectLinkedPointSearch").data("linkType"));
		    stopSpinnerOnButton('#submitLinkedPointSearch', searchDialogSearch);            
		},
	});
	$.ajax();
}

function ajaxLoadTabbedArea(tabButtonControl, tabbedAreaSelector, ajaxURL, data, contentName) {
    $(tabbedAreaSelector).html('<div><img src="/static/img/ajax-loader.gif" /></div>');
	toggleTabbedArea(tabButtonControl, tabbedAreaSelector);
	$.ajax({
		url: ajaxURL,
		type: 'GET',
		data: data,
		success: function(data) {
			$(tabbedAreaSelector).empty();
			$(tabbedAreaSelector).html($.parseJSON(data));
			makePointsCardsClickable();	 
			setUpLinkedPointListControls();
			
            $( "#child_unlinkToggle" ).button().click(function() {
                toggleUnlink(this, "child");
            });
		},
		error: function(data) {
			$(tabbedAreaSelector).empty();
			showAlert('<strong>Oops!</strong> There was a problem loading the ' + contentName + '.  Please try again later.');
		},
	});
}

function changeEditorsPick() {
    pick = $('#editorsPick').get(0).checked;
    pickSort = $("#editorsPickSort").val();
    if (pick && !isNormalInteger(pickSort)) {
        showAlertAfter('Editors Pick must have a positive whole number for Editors Pick Sort', '#changeEditorsPick [name="alertArea"]');
    } else {
        startSpinnerOnButton('#submitChangeEditorsPick');        
        $.ajaxSetup({
    		url: "/changeEditorsPick",
    		global: false,
    		type: "POST",
    		data: {
    			'urlToEdit': $('#pointArea').data('pointurl'),
    			'editorsPick': pick,
    			'editorsPickSort': pickSort
    		},
    		success: function(data) {
		    	obj = JSON.parse(data);
    			if (obj.result == true) {
    		        // set the values in the main point page
        		    if (pick) {
        		        $('#changeEditorsPickTrigger').text('Editors Pick: True - ' + pickSort);  		        		        
        		    } else {
        		        $('#changeEditorsPickTrigger').text('Editors Pick: False');         		        
        		    }
        		    stopSpinnerOnButton('#submitChangeEditorsPick', changeEditorsPick);
        		    $('#changeEditorsPick').modal('hide');
        		    showSuccessAlert('Editors Picks updated.')    		    
        		} else {
        		    showAlertAfter('Server error: ' + obj.error + '. You may try again.', '#changeEditorsPick [name="alertArea"]');                    
        		    stopSpinnerOnButton('#submitChangeEditorsPick', changeEditorsPick);          		    
        		}        		          
    		},    		
    	});
    	$.ajax();
    }
}

$(document).ready(function() {

    if (!loggedIn) {
        $( "[name=linkSupportingPoint]" ).attr('href',"#loginDialog");
        $( "[name=linkSupportingPoint]" ).attr('data-toggle',"modal");
        make_this_show_login_dlg($( "[id$=unlinkToggle]" ));
        make_this_show_login_dlg($( "[id$=addPointWhenNonZero]" ));
        make_this_show_login_dlg($( "[id$=addPointWhenZero]" ));
        make_this_show_login_dlg($( "#editPoint" ));
        make_this_show_login_dlg($( "#changeImage" ));
        make_this_show_login_dlg($( "#addImage" ));        
        make_this_show_login_dlg($( "#upVote" ));
        make_this_show_login_dlg($( "#downVote" ));
        make_this_show_login_dlg($( "#viewPointHistory" ));
        make_this_show_login_dlg($( "#showAddComment" ));
        make_this_show_login_dlg($( "[name=commentReply]" ));        
    } else {

        $( "#supporting_unlinkToggle" ).button().click(function() {
        	toggleUnlink(this, "supporting");
        });

        $( "#counter_unlinkToggle" ).button().click(function() {
            toggleUnlink(this, "counter");
        });

        $( "#upVote" ).click(function() {upVote();});

        $( "#downVote" ).click(function() {	downVote();	});
        $( "#blueRibbon" ).click(function() {changeRibbon();});        

        setUpMenuAreas();

        $('#linkedPointSearchDialog').on('hidden', function () {
            $("#selectLinkedPointSearch").data("linkType", "");
            $("#selectLinkedPointSearch").data("nodetype", "");            
            $("#searchResultsArea").children().remove();
            $("#selectLinkedPointSearch").val('');
        });

        $("#selectLinkedPointSearch").keyup(function(event){
        	if(event.keyCode == 13){
        	    searchDialogSearch();
        	}
        });
        
        $('#submitLinkedPointSearch').click(searchDialogSearch);
        
        $('#showAddComment').click(function() {
            tinyMCE.execCommand('mceRemoveControl', false, 'commentText');
            $("#addComment").insertAfter($(event.target).parent());    
            initTinyMCE();            
            $('#addComment').removeClass('hide');
            $('#showAddComment').parent().addClass('hide');
            $('#addComment').data('parentkey', '');
            $('body, html').animate({ scrollTop: $("#addComment table").offset().top - 100 }, 500);        
        });

        $('[name=commentReply]').click(showReplyComment);
        $('#saveCommentSubmit').click(saveComment);    
        
    }
    
    makePointsCardsClickable();	    
    // makeLinkedPointsClickable();
    // linkPointControlsInitialState();

    $( "#deletePoint" ).button();

    // Beginning state for the TABBED AREAS
    $('.tabbedArea').hide(); $('#supportingPointsArea').show();

    $('#viewSupportingPoints').click(function() {
        toggleTabbedArea(this, "#supportingPointsArea");
    });
    
    $('#viewPointHistory').click(function() {
        ajaxLoadTabbedArea(this, '#historyArea', '/pointHistory', { 'pointUrl': pointURL }, 'point history')
    });
    
    $('#viewChildObjectives').click(function() {
        $('#childProjectsArea').empty();        
        ajaxLoadTabbedArea(this, '#childObjectivesArea', '/getChildPoints', 
            { 'pointUrl': pointURL, 'nodeType': 'Objective' }, 'objectives');
    });
    
    $('#viewChildProjects').click(function() {
        $('#childObjectivesArea').empty();                
        ajaxLoadTabbedArea(this, '#childProjectsArea', '/getChildPoints', 
            { 'pointUrl': pointURL, 'nodeType': 'Project' }, 'projects');        
    });
	
    // These elements are admin only, but jquery degrades gracefully, so not checking for their presence
    $('#changeEditorsPickTrigger').on('click', function() {
        title = $('#pointSummary div.mainPointTitle').text();
        $("#changeEditorsPick .modal-header h4").text(title);
        $("#changeEditorsPick").modal('show');
    }); 
    
    $('#submitChangeEditorsPick').on('click', changeEditorsPick);    
    
});
