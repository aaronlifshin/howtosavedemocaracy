

function searchDialogAlert(alertHTML) {
    $('#linkedPointSearchDialog #alertArea').html($('<div class="alert"><button type="button" class="close" data-dismiss="alert">&times;</button>' + alertHTML + '</div>'));
}

function toggleUnlink(linkType) {
    unlinkVisible = !$("[id^=unlink_" + linkType + "]").hasClass("ui-helper-hidden");
	if ( unlinkVisible ) {
		$("[id^=goTo_" + linkType + "]").removeClass("ui-helper-hidden");
		$("[id^=goTo_" + linkType + "]").show();
		$("[id^=goTo_" + linkType + "]").button();
		$("[id^=unlink_" + linkType + "]").addClass("ui-helper-hidden");
		$(".ui-helper-hidden").hide();
		$("#" + linkType + "_unlinkToggle").html('<span class="ui-button-text">Unlink</span>');
		unlinkVisible = false;
	} else {
		$("[id^=goTo_" + linkType + "]").addClass("ui-helper-hidden");
		$( ".ui-helper-hidden" ).hide();
		$( "[id^=unlink_" + linkType + "]").removeClass("ui-helper-hidden");
		$( "[id^=unlink_" + linkType + "]").show();
		$( "[id^=unlink_" + linkType + "]").button();
		$("#" + linkType + "_unlinkToggle").html('<span class="ui-button-text">Cancel</span>');
		unlinkVisible = true;
	}
}

function callPointEdit(){
    if ($('#title_pointDialog').val().length > MAX_TITLE_CHARS) {
        alert('Too many characters in the title');
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

function pointUnlink(supportingPointURL, linkType) {
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
            $('#'+linkType+'Point_' + obj.pointURL).remove();
            if ($("[id^=" + linkType +"Point_]").length == 0 ) {
                $("#" + linkType + "_zeroPoints").show();
                $("#" + linkType + "_nonzeroPoints").hide();
                $("[name=" + linkType + "_linkPoint]").button();
            } else {
                setPointListHeader(linkType);
            }
            toggleUnlink(linkType);
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
        $("#voteLabel").text("You agree");
        upVoteToggle(true);
    } else if (myVote == 0 && newVote == -1) { // DOWNVOTE
        var newVal = parseInt(downvoteLabel) + 1;
        $( "#downVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) - 1);
        $("#voteLabel").text("You disagree");        
        downVoteToggle(true);
    } else if (myVote == 1  &&  newVote == 0) { // CANCEL UPVOTE
        var newVal = parseInt(upvoteLabel) - 1;
        $( "#upVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) - 1);
        $("#voteLabel").text("You abstain");                
        upVoteToggle(false);
    } else if (myVote == -1  &&  newVote == 0) { // CANCEL DOWNVOTE
        var newVal = parseInt(downvoteLabel) - 1;
        $( "#downVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) + 1);
        $("#voteLabel").text("You abstain");                
        downVoteToggle(false);
    } else if (myVote == -1  &&  newVote == 1) { // DOWN TO UP
        var newVal = parseInt(downvoteLabel) - 1;
        $( "#downVote a" ).text(newVal.toString());
        var newVal = parseInt(upvoteLabel) + 1;
        $( "#upVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) + 2);
        $("#voteLabel").text("You agree");        
        downVoteToggle(false);
        upVoteToggle(true);
    } else if (myVote == 1  &&  newVote == -1) {// UP TO DOWN
        var newVal = parseInt(downvoteLabel) + 1;
        $( "#downVote a" ).text(newVal.toString());
        var newVal = parseInt(upvoteLabel) - 1;
        $( "#upVote a" ).text(newVal.toString());
        $( "#bigScore" ).text(parseInt(bigScore) - 2);
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

function selectPoint(supportingPointURL, currentPointURL, linkType){
  	$.ajaxSetup({
		url: "/linkPoint",
		global: false,
		type: "POST",
	 	data: {
			'supportingPointURL': supportingPointURL,
			'parentPointURL': currentPointURL,
			'linkType': linkType
			},
		success: function(data){
		  obj = JSON.parse(data);
		  if (obj.result == true) {
              pointListAppend(linkType, obj.newLinkPoint, obj.numLinkPoints);
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

function setPointListHeader(linkType) {
    numLinkPoints = $("[id^=" + linkType +"Point_]").length;
    if (numLinkPoints == 0) {
        header = "Zero " + linkType.capitalize() + " Points";
    } else {
        header = numLinkPoints + " " +  linkType.capitalize() + (numLinkPoints == 1 ? " Point":" Points");
    }
    $("#"+linkType+"_numberOfPoints").text( header );
}

function pointListAppend(linkType, point, numLinkPoints) {
    if ($("[id^=" + linkType +"Point_]").length == 0 ) {
      $("#" + linkType + "_zeroPoints").hide();
      $("#" + linkType + "_nonzeroPoints").show();
    }

	var color = point.voteTotal >= thresholdGreen ? "green" : point.voteTotal <= thresholdRed ? "red" : "yellow";
    // We need to create 4 divs
    // The top-level pointSmall row-fluid
    pointDiv = $('<div/>', { class:color + " pointSmall row-fluid", id:linkType+"Point_"+point.url});

    // The vote total and title
    titleDiv = jQuery('<div/>',{class:"span8 title"} );
	titleDiv.html("<h5><span class=\"score\">" + point.voteTotal +
	              "</span>" + point.title + "</H5>");

    // The image div
    imageDiv = jQuery('<div/>',{class:"span2"} );
    if (point.imageURL && point.imageURL != "") {
        imageDiv.html("<img class=\"smallDisplay\" src=\"" + point.summaryMediumImage + "\" />");
    } else {
        imageDiv.html("");
    }

    // The controls div
    controlsDiv = jQuery('<div/>',{class:"span2 grayBackground"} );
    controlsDiv.html("<a class=\"navWhy pull-right\" id=\"goTo_"+linkType+"_"+point.url +
      "alt=\"Why" + point.title +  "\" href=\"/point/" + point.url +
      "\"src=\"/static/img/arrow_why_A_grey.png\"></a><a class=\"unlinkbutton pull-right\" id=\"unlink_" +
      linkType+"_"+point.url + "\"  href='javascript:;' onclick='javascript:pointUnlink(\""+
      point.url + "\" , \"" + linkType + "\")' alt=\"Unlink " +
      linkType + " Point: " + point.title + "\" ></a>"
        );
    appendAfter = $("#" + linkType + "_pointList");
    pointDiv.append(titleDiv);
    pointDiv.append(imageDiv);
    pointDiv.append(controlsDiv);
    appendAfter.append(pointDiv);
    setPointListHeader(linkType);
    linkPointControlsInitialState();
    makeLinkedPointsClickable();
}


function addPoint(linkType){
    unlinkVisible = !$("[id^=unlink_" + linkType + "]").hasClass("ui-helper-hidden");
    if (unlinkVisible) toggleUnlink(linkType);

    var dialogID = "#pointDialog"
    if ($('#title_pointDialog').val().length > MAX_TITLE_CHARS) {
        alert('Too many characters in the title');
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
                pointListAppend(linkType, obj.newLinkPoint, obj.numLinkPoints);
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
	$("[id^=searchPoint_]",$(".searchColumn")).remove();
	
	obj = JSON.parse(data);
	
	if (obj.result == true) {
		appendAfter = $(".searchColumn");
		appendAfter.append(obj.resultsHTML);
        setUpSelectPointButtons();
        setUpPopoutButtons();
	} else {
		searchDialogAlert('There were no results for: ' + $(".searchBox").val() + ' or that is already a linked point');
	}
}

function setUpSelectPointButtons() {
    $("[id^=selectPoint_div_]").on('click', function(e){
        var theLink = $(this);
        selectPoint(theLink.data('pointurl'), pointURL, theLink.data('linktype'));
    });
}

function setUpPopoutButtons() {
    $("[id^=popoutPoint_]").on('click', function(e){
        var theLink = $(this);
        window.open( "/point/" + theLink.data('pointurl'),theLink.data('pointtitle') , "height=800,width=1000");
    });
}

function setUpMenuAreas() {
    // Dropdown add of the recently viewed points
    $("[name^=selectPoint_menu_]").on('click', function(e){
        var theLink = $(this);
        var linkPointURL = theLink.data('pointurl');
        selectPoint(linkPointURL, pointURL, theLink.data('linktype'));
        $("[name^=selectPoint_menu_]").filter("*[data-pointurl=\""+ linkPointURL + "\"]").remove();
    });

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

    // Create a new linked point
    $( "[name=createLinked]" ).on('click', function() {
        var linkType = $(this).data('linktype');
        $("#submit_pointDialog").data("dialogaction", "createLinked");
        $("#submit_pointDialog").data("linktype", linkType);
        $("#submit_pointDialog").data("nodetype", "Point");
        var dialogName = "Create " + linkType.capitalize() + " Point";
        $('div.modal-header h3', $('#pointDialog')).text(dialogName);
        $("#pointDialog").modal('show');
    });
    
    $( "[name$=_searchForPoint]" ).on('click', function(e){
        $("#selectLinkedPointSearch").data("linkType", $(this).data('linktype'));
        $("#linkedPointSearchDialog").modal('show');
    });
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
        /*$( "[name=linkSupportingPoint]" ).click(function() {
          var params = [];
          params["parentPointURL"] = pointURL;
          post_to_url("/selectSupportingPoint", params);
        });*/

        $( "#supporting_unlinkToggle" ).button().click(function() {
        	toggleUnlink("supporting");
        	});

        $( "#counter_unlinkToggle" ).button().click(function() {
            toggleUnlink("counter");
            });

        $( "#upVote" ).click(function() {upVote();});
        //$('#upVote').button({ icons: {primary: 'ui-icon-up', secondary: null}});

        $( "#downVote" ).click(function() {	downVote();	});
        $( "#blueRibbon" ).click(function() {changeRibbon();});        

        setUpMenuAreas();

        $('#linkedPointSearchDialog').on('hidden', function () {
            $("#selectLinkedPointSearch").data("linkType", "");
            $("[id^=searchPoint]",$(".searchColumn")).remove();
            $(".searchBox").val('');
        });

        $("#selectLinkedPointSearch").keyup(function(event){
    		if(event.keyCode == 13){
    			$.ajaxSetup({
    				url: "/ajaxSearch",
    				global: false,
    				type: "POST",
    				data: {
    					'searchTerms': $(".searchBox").val(),
    					'exclude' : pointURL,
    					'linkType' : $("#selectLinkedPointSearch").data("linkType")
    				},
    				success: function(data) {displaySearchResults(data, $("#selectLinkedPointSearch").data("linkType"));},
    			});
    			$.ajax();
    	    }
        });
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
    }
    
    makeLinkedPointsClickable();
    linkPointControlsInitialState();

    $( "#deletePoint" ).button();

    // Beginning state for the TABBED AREAS
    $('.tabbedArea').hide(); $('#supportingPointsArea').show();

    $('#viewSupportingPoints').click(function() {
        toggleTabbedArea(this, "#supportingPointsArea");
    });
    
    $('#saveCommentSubmit').click(saveComment);


    

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
