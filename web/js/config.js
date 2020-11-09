var url_ws = location.origin + "/";

function sendRequest(method, request = "", payload = "")
{
	payload = JSON.stringify(payload);
	var result;
	var settings = {
		"async": false,
		"cache": false,
		"crossDomain": true,
		"url": url_ws + request,
		"method": method,
		"headers": {
			"Accept": "application/json;charset=utf-8",
			"Content-Type": "application/json;charset=utf-8",
			"Cache-Control": "no-cache"
		},
		"processData": false,
		"data": payload
	};
	$.ajax(settings).done(function ( data, textStatus, jqXHR )
	{	
		result = jqXHR;
	}
	).fail(function(jqXHR, textStatus, errorThrown)
	{
		result = "Error";
  	});
	return result;
}

function sendRequest_2(method, request = "")
{
    var result;
    var settings = {
        "async": false,
        "cache": false,
        "crossDomain": true,
        "url": url_ws + request,
        "method": method,
        "headers": {
            "Accept": "application/json;charset=utf-8",
            "Content-Type": "application/json;charset=utf-8",
            "Cache-Control": "no-cache"
        },
        "processData": false,
        "data": ''
    };

    $.ajax(settings).done(function ( data, textStatus, jqXHR )
    {
        console.log(data, textStatus, jqXHR);
        result = jqXHR;
    }
    ).fail(function(jqXHR, textStatus, errorThrown)
    {
        result = "Error";
        console.log(jqXHR, textStatus, errorThrown);
    });

    return result;
}

function crear(nombre,dato)
{
    $.session.set(nombre, dato); // crear sesion
}

function ver(nombre)
{
    return $.session.get(nombre);
}

function borrar(nombre)
{
    $.session.delete(nombre);
}

function modificar(nombre,dato)
{
    $.session.set(nombre, dato);
}

var filename = "";

function exportTableToExcel_1(tableID)
{
    var downloadLink;
    var dataType = 'application/vnd.ms-excel;charset=UTF-8'; //'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    
    // Specify file name
    filename = filename+'.xlsx';
    
    // Create download link element
    downloadLink = document.createElement("a");
    
    document.body.appendChild(downloadLink);
    
    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
    
        // Setting the file name
        downloadLink.download = filename;
        
        //triggering the function
        downloadLink.click();
    }
}

function exportTableToExcel(tableId)
{
    var uri = 'data:application/vnd.ms-excel;base64,'
    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
    , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
    , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

     var table = document.getElementById(tableId)
     var ctx = { worksheet: filename|| 'Worksheet', table: table.innerHTML }

     var enlaceTmp = document.createElement('a');
     enlaceTmp.href =  uri + base64(format(template, ctx));
   enlaceTmp.download = filename + '.xls';
   enlaceTmp.click();
}

$("#cerrar_login").click(function()
{
    borrar("usuario_login");
    window.location = '../index.html';                
});