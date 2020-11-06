$("#btn_login").click(function()
{
	var usu = $("#inputUsuario").val();
	var psw = $("#inputPassword").val();
	var persona = new Object();

	if(usu !== "" || psw !== "")
	{
		if(usu !== "")
		{
			if(psw !== "")
			{
				var payload = {
					"usuario": usu,
					"password": psw
				};

				var request = 'usuario/login';

				var result = sendRequest("POST", request, payload);

				console.warn('Login', result);
				
				if(result.statusText == "OK" && result.responseText != "NOK" && result.status == 200)
				{
					persona.nombre = result.responseJSON.nombre;
					persona.perfil = result.responseJSON.perfil;
					persona.status = result.responseJSON.status;
					console.warn('Login', persona);

					borrar("usuario_login");
					crear("usuario_login", JSON.stringify(persona));
					if (persona.status === true) 
					{
						$("#form_login").submit();
					}
					else
					{
						$.alert({title: 'Advertencia',content: 'Usuario no esta activo',});
					}
										
				}
				else if(result.responseText == "NOK" && result.status == 200)
				{
					$.alert({title: 'Advertencia',content: 'Credenciales incorrectas o el usuario no existe',});
				}
				else if(result.statusText == "No Content" && result.status == 204)
				{
					$.alert({title: 'Advertencia',content: 'Usuario es incorrecto o no existe.',});
				}
				else if(result === 'Error' )
				{
					$.alert({title: 'Advertencia',content: 'No hay conexion al aservidor.',});
				}
			}
			else
			{
				$.alert({title: 'Advertencia',content: 'Ingrese su password',});
			}
		}
		else
		{
			$.alert({title: 'Advertencia',content: 'Ingrese su usuario',});
		}
	}
	else
	{
		$.alert({title: 'Advertencia',content: 'Ingrese su usuario y password',});
	}
});