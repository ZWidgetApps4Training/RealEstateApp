/* on document ready function
    1. Get the pageinfo and get all templates records
    2. On template change fill the msg box with template content!
    3. On button_click do their corresponding actions!
*/
$(document).ready(function(){
            var AuthToken,accSid,mobNum,mob,recId,globRecData = [];
            $("div#msgTemplate").hide();
            ZOHO.embeddedApp.init().then(function(){
                ZOHO.CRM.INTERACTION.getPageInfo()
                .then(function(data){  
                    var Mobile_Number = data.data["Mobile"];
                    var fullName = data.data["Full_Name"];
                    var record_id = data.data["id"];
                    recId = record_id;
                    mob = Mobile_Number;
                    $("#mobileId").html(Mobile_Number);
                    $("#fullNameId").html(fullName);
                    $("#mobileId1").html(Mobile_Number);
                    $("#fullNameId1").html(fullName);
                    ZOHO.CRM.CONFIG.getOrgVariable("Twilio AuthToken")
                    .then(function(data){
                        var newOrg = (data.Success);
                        var Twilio_AuthToken = newOrg.Content; 
                        AuthToken = Twilio_AuthToken;
                    });
                    ZOHO.CRM.CONFIG.getOrgVariable("Twilio Account SID")
                    .then(function(data){
                        var newOrg = (data.Success);
                        var Twilio_Account_SID = newOrg.Content;
                        accSid = Twilio_Account_SID;
                    });
                    ZOHO.CRM.CONFIG.getOrgVariable("Twilio Mobile Number")
                    .then(function(data){
                        var newOrg = (data.Success);
                        var Twilio_Mobile_Number = newOrg.Content; 
                        mobNum = Twilio_Mobile_Number;
                    });              
                });
                
                ZOHO.CRM.API.getAllRecords({Entity:"Templates"})
                .then(function(data){
                    debugger;
                    globRecData = data;
                    if(data.length > 0)
                    {
                        $("#msgcontent").val(data[0].Template_Body);
                    }
                   for(i=0;i<data.length;i++)
                   {
                        $("#namesList").append("<option value="+i+">"+data[i].Name+"</option>")
                   }
                   $('select').each(function(){
                    debugger;
                        var $this = $(this), numberOfOptions = $(this).children('option').length;
                        $this.addClass('select-hidden'); 
                        $this.wrap('<div class="select"></div>');
                        $this.after('<div class="select-styled"></div>');
                        var $styledSelect = $this.next('div.select-styled');
                        $styledSelect.text($this.children('option').eq(0).text());
                        var $list = $('<ul />', {
                            'class': 'select-options'
                        }).insertAfter($styledSelect);
                        for (var i = 0; i < numberOfOptions; i++) {
                            $('<li />', {
                                text: $this.children('option').eq(i).text(),
                                rel: $this.children('option').eq(i).val()
                            }).appendTo($list);
                        }
                        var $listItems = $list.children('li');
                        $styledSelect.click(function(e) {
                            e.stopPropagation();
                            $('div.select-styled.active').not(this).each(function(){
                                $(this).removeClass('active').next('ul.select-options').hide();
                            });
                            $(this).toggleClass('active').next('ul.select-options').toggle();
                        });
                        $listItems.click(function(e) {
                            e.stopPropagation();
                            $styledSelect.text($(this).text()).removeClass('active');
                            var index = parseInt($(this).attr('rel'));
                            $this.val($(this).attr('rel'));
                            $("#msgcontent").val(globRecData[index].Template_Body); 
                            $list.hide();
                        });
                        $(document).click(function() {
                            $styledSelect.removeClass('active');
                            $list.hide();
                        });
                    });
                });           
            });  

            $("#submit1").click(function(){
                var msgContent = $("input[name='Message Content']").val().trim();
                if(msgContent == "")
                {
                    $('.success').slideDown(function() {
                    $('.success').delay(3000).slideUp();
                    });
                }
                else
                {
                    var newVar = accSid + ":" + AuthToken;
                    baseEncoded = btoa(newVar);
                    var encode = baseEncoded.replace('\n', '');
                    $.ajax({
                        url : "https://api.twilio.com/2010-04-01/Accounts/" + accSid + "/Messages.json",
                        type: 'POST',
                        dataType : "json",
                        headers: {"Authorization":"Basic " + encode},
                        data: {"To" : mob , "From" : mobNum , "Body" : msgContent},
                        success : function(data){
                            $('.success1').slideDown(function() {
                            $('.success1').delay(2000).slideUp();
                            });
                            ZOHO.CRM.API.addNotes({Entity:"Leads",RecordID:recId,Title:"Message Sent",Content:msgContent})
                            .then(function(data){
                                ZOHO.CRM.UI.Popup.closeReload();
                            });
                            
                        }
                    });
                }
            });

            $("#submit5").click(function(){
                $("#namesList>option").each(function(){
                    if($(this).is(':selected')){
                        var msgContent = $(this).text();
                    }
                    var newVar = accSid + ":" + AuthToken;
                    baseEncoded = btoa(newVar);
                    var encode = baseEncoded.replace('\n', '');
                    $.ajax({
                        url : "https://api.twilio.com/2010-04-01/Accounts/" + accSid + "/Messages.json",
                        type: 'POST',
                        dataType : "json",
                        headers: {"Authorization":"Basic " + encode},
                        data: {"To" : mob , "From" : mobNum , "Body" : msgContent},
                        success : function(data){
                            $('.success1').slideDown(function() {
                            $('.success1').delay(2000).slideUp();
                            });
                            ZOHO.CRM.API.addNotes({Entity:"Leads",RecordID:recId,Title:"Message Sent",Content:msgContent})
                            .then(function(data){
                                ZOHO.CRM.UI.Popup.closeReload();
                            }); 
                        }
                    });
                });
            });

            $("#submit2").click(function(){
                ZOHO.CRM.UI.Popup.closeReload();
            });
            $("#submit3").click(function(){
                $("div#MatchNotFound").hide();
                $("div#msgTemplate").show();
            });
            $("#submit4").click(function(){
                $("div#MatchNotFound").show();
                $("div#msgTemplate").hide();
            });
        });        