$(function()
{
	var usuario = ver("usuario_login");
	console.log("usuario.length",usuario);

	if(ver("usuario_login"))
	{	
		$(".se-pre-con").show();		
	}
	else
	{
		borrar("usuario_login");
		window.location = '../index.html';
	}
});


$(".caraga_reporte").click(function()
{
	$('.cargando').css("display", "block");
	$('.descargar_excel').css("display", "none");
	var request = 'opcion/';

	var pais = $('#select_pais').val();
	var tipo = $('#select_tipo').val();
	var rrss = $('#select_rrss').val();
	var fecha = $('#Rfecha').val();

    var array_fechas = [];
    var array_colas = [];
    var array_opciones = [];

    var html_tbl ="";

    var html_head = "";
    var html_body = "";

    var html_tbl_exc ="";

    var html_head_exc = "";
    var html_body_exc = "";

    
	if(pais !== "")
	{
		if(tipo !== "")
		{
			if(fecha !== "")
			{
				filename = 'Estadisticas '+ $('#select_pais option:selected').text() + ' - ' + rrss + ' - ' + $('#select_tipo option:selected').text();
				
				$('#titulo').text(filename);

				filename = filename + "_"+fecha.replace(/\//g,'-');

				if (tipo === "op") { request += "searchOp";} else { request += "searchIn"; }

				$(".caraga_reporte").attr("disabled", true);
				$('#tabla_reporte').css("display", "none");
		    	$("#select_pais").css("border-color", "#ced4da");
		    	$("#select_tipo").css("border-color", "#ced4da");
		    	$("#Rfecha").css("border-color", "#ced4da");

				var payload = {
				    "pais": pais,
				    "fecha": fecha,
				    "rrss": rrss 
				};

				console.log(payload);

				payload = JSON.stringify(payload);

				var result;

				var settings = {
					"async": true,
					"cache": false,
					"crossDomain": true,
					"url": url_ws + request,
					"method": "POST",
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
					$(".caraga_reporte").attr("disabled", false);
					$('#tabla_reporte').css("display", "block");
					$('.cargando').css("display", "none");
					if ((result.status === 200 && result.statusText === 'OK') && result.responseText !== 'NOK')
					{
						console.log($('.cargando').is(":visible"));
						$('.descargar_excel').css("display", "block");
						console.log('[caraga_reporte] :: [searchOp] :: ',result.responseJSON);

						var result = result.responseJSON;
						
						$("#tabla_reporte").empty();

						html_tbl += '<table id="tbl_int"  class="table table-striped table-responsive table-bordered tbl_int">';
							html_tbl += '<thead id="thead_int" class="warning">';
								html_tbl += '<tr id="tr_int" ></tr>';
							html_tbl += '</thead>';
							html_tbl += '<tbody id="tbody_int"></tbody>';
					    html_tbl += '</table>';

					    html_tbl_exc += '<table id="tbl_int_exc"  class="table table-striped table-responsive table-bordered ">';
							html_tbl_exc += '<thead id="thead_int_exc" class="warning">';
								html_tbl_exc += '<tr id="tr_int_exc" ></tr>';
							html_tbl_exc += '</thead>';
							html_tbl_exc += '<tbody id="tbody_int_exc"></tbody>';
					    html_tbl_exc += '</table>';

					    $("#tabla_reporte").html(html_tbl);
					    $("#tabla_reporte_excel").html(html_tbl_exc);

						if (tipo === "op")
						{
							html_head += "<th class='static fecha' scope='col'  >Fecha</th>";
							html_head_exc += "<th class='static fecha' scope='col'  >Fecha</th>";

							for(var f in result)
							{							
								array_fechas.push(f);
								html_body += "<tr id='"+f+"'>";
								html_body += "<td class='static fecha ' scope='col'>"+f+"</td>";
								html_body += "</tr>";

								html_body_exc += "<tr id='exc_"+f+"'>";
								html_body_exc += "<td class='static fecha ' scope='col'>"+f+"</td>";
								html_body_exc += "</tr>";
							}

							$('#tbody_int').append(html_body);
							$('#tbody_int_exc').append(html_body_exc);
							var primero = 0;
							for(var i = 0; i < array_fechas.length; i++)
							{
								var opciones = result[array_fechas[i]];
								
								for(var t in opciones)
								{
									if(!array_opciones.includes(t))
									{
										array_opciones.push(t);
										//html_head += "<th scope='col'>"+t+"</th>";
										if (primero == 0) 
										{
											html_head += "<th class='first-col' scope='col'>"+t+"</th>";
											html_head_exc += "<th class='first-col' scope='col'>"+t+"</th>";
											primero = 1;
										}
										else
										{
											html_head += "<th scope='col' class='contenido'>"+t+"</th>";
											html_head_exc += "<th class='first-col' scope='col'>"+t+"</th>";										
										}
									}
								}
							}

							$('#tr_int').append(html_head);
							$('#tr_int_exc').append(html_head_exc);
							var first = 0;
							for(var i = 0; i < array_fechas.length; i++)
							{
								
								if(result.hasOwnProperty(array_fechas[i]))
								{    
									var first = 0;      
									var transferencia = result[array_fechas[i]];
									for(var c = 0; c < array_opciones.length; c++)
									{            
										if(transferencia.hasOwnProperty(array_opciones[c]))
										{          
											//html_body = "<td>"+transferencia[array_opciones[c]]+"</td>";
											if (first == 0) 
											{
												html_body = "<td  class='first-col'>"+transferencia[array_opciones[c]]+"</td>";
												html_body_exc = "<td  class='first-col'>"+transferencia[array_opciones[c]]+"</td>";
												first = 1;
											} 
											else
											{
												html_body = "<td class='contenido'>"+transferencia[array_opciones[c]]+"</td>";
												html_body_exc = "<td class='contenido'>"+transferencia[array_opciones[c]]+"</td>";											
											}    
										}
										else
										{
											html_body = "<td class='contenido'>-</td>";
											html_body_exc = "<td class='contenido'>-</td>";
										}        

										$('#'+array_fechas[i]).append(html_body); //tr id de una fecha
										$('#exc_'+array_fechas[i]).append(html_body_exc); //tr id de una fecha
									}  
								}
							}

						}
						else if (tipo === "in")
						{
							html_head += "<th  class='static fecha' scope='col' >Fecha</th>";
							html_head += "<th  class=' intercciones' scope='col' >Interacciones</th>";
							html_head += "<th  class=' fuera_hor ' scope='col' >Fuera de horario</th>";

							html_head_exc += "<th  class='static fecha' scope='col' >Fecha</th>";
							html_head_exc += "<th  class=' intercciones' scope='col' >Interacciones</th>";
							html_head_exc += "<th  class=' fuera_hor ' scope='col' >Fuera de horario</th>";

							for(var f in result.interacciones)
							{
								if(result.interacciones[f] > 0)
								{
									array_fechas.push(f);
									html_body += "<tr id='"+f+"'>";
									html_body += "<td class='static fecha ' scope='col'>"+f+"</td>";
									html_body += "<td  class='intercciones' scope='col'>"+result.interacciones[f]+"</td>";
									html_body += "</tr>";

									html_body_exc += "<tr id='exc_"+f+"'>";
									html_body_exc += "<td class='' scope='col'>"+f+"</td>";
									html_body_exc += "<td  class='' scope='col'>"+result.interacciones[f]+"</td>";
									html_body_exc += "</tr>";
								}                
							}

							$('#tbody_int').append(html_body);
							$('#tbody_int_exc').append(html_body_exc);

							for(var i = 0; i < array_fechas.length; i++)
							{
								var transferencia = result.transferencias[array_fechas[i]];
								for(var t in transferencia)
								{
									if(!array_colas.includes(t))
									{
										array_colas.push(t);
										html_head += "<th class=' fuera_hor 'scope='col'>"+t+"</th>";
										html_head_exc += "<th class=''scope='col'>"+t+"</th>";
									}
								}
							}

							$('#tr_int').append(html_head); 
							$('#tr_int_exc').append(html_head_exc);

							for(var i = 0; i < array_fechas.length; i++)
							{
								if(result.fueraHorario.hasOwnProperty(array_fechas[i]))
								{
									html_body = "<td class='contenido'>"+result.fueraHorario[array_fechas[i]]+"</td>";
									html_body_exc = "<td class='contenido'>"+result.fueraHorario[array_fechas[i]]+"</td>";
								}
								else
								{
									html_body = "<td class='contenido'>-</td>";
									html_body_exc = "<td class='contenido'>-</td>";
								}

								$('#'+array_fechas[i]).append(html_body);
								$('#exc_'+array_fechas[i]).append(html_body_exc);

								if(result.transferencias.hasOwnProperty(array_fechas[i]))
								{          
									var transferencia = result.transferencias[array_fechas[i]];
									for(var c = 0; c < array_colas.length; c++)
									{            
										if(transferencia.hasOwnProperty(array_colas[c]))
										{          
											html_body = "<td class='contenido'>"+transferencia[array_colas[c]]+"</td>";
											html_body_exc = "<td class='contenido'>"+transferencia[array_colas[c]]+"</td>";
										}
										else
										{
											html_body = "<td class='contenido'>-</td>";
											html_body_exc = "<td class='contenido'>-</td>";
										}        

										$('#'+array_fechas[i]).append(html_body); 
										$('#exc_'+array_fechas[i]).append(html_body_exc); //tr id de una fecha
									}  
								}
							}
						}

	    				$('.tbl_int').DataTable({
	                        "destroy": true,
	                        "pageLength": 10,
	                        //"ordering": false,
	                        "bDestroy": true,
	                        "columnDefs": [
	                        ],
	                        "language": {
	                            "url": "../js/JQuery/dataTable/Spanish.json",
	                            "lengthMenu": "",
	                            "zeroRecords": "Lo siento no hay información",
	                            "info": ""
	                        }                               
	                    } );
					}
					else if (result.status === 200 && result.responseText == 'NOK') 
					{
						$('.descargar_excel').css("display", "none");
						$("#tabla_reporte").empty();
						$('#titulo').text('Estadisticas ');
						$.alert({
						    title: 'Estadisticas',
						    content: 'No se encontraron datos',
						});
						$('.cargando').css("display", "none");

						$(".caraga_reporte").attr("disabled", false);
					}
				}
				).fail(function(jqXHR, textStatus, errorThrown)
				{
					result = "Error";

					$(".caraga_reporte").attr("disabled", false);
			  	});				
			}
			else
			{
		    	$("#select_pais").css("border-color", "#ced4da");
		    	$("#select_tipo").css("border-color", "#ced4da");
		    	$("#Rfecha").css("border-color", "#ef3829");
				$('.cargando').css("display", "none");
				$.alert({title: 'Advertencia',content: 'Seleccione un rango de fechas para continuar',});
			}
		}
		else
		{
	    	$("#select_pais").css("border-color", "#ced4da");
	    	$("#select_tipo").css("border-color", "#ef3829");
			$('.cargando').css("display", "none");
			$.alert({title: 'Advertencia',content: 'Seleccione un tipo de consulta para continuar',});
		}
	}
	else
	{
	    $("#select_pais").css("border-color", "#ef3829");
		$('.cargando').css("display", "none");
		$.alert({title: 'Advertencia',content: 'Seleccione una pais para continuar',});
	}
});