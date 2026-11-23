const loginService = require('../services/loginService');

async function validarUsuario(req, res) {
  try {
    const { usuario, contrasena } = req.body;

    const estados = await loginService.existeUsuario(usuario, contrasena, req.ip);

    console.log('Estados devueltos por el servicio:', estados);

    if (estados.outFlagExiste == false) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos', success: false });
    }
    return res.status(200).json({ message: 'Usuario validado correctamente', isAdmin: estados.outFlagEsAdmin === true, success: true });
    
  } catch (error) {
    console.error('Error al validar usuario:', error);
    res.status(500).json({ message: 'Error al validar usuario'});
  }
}

async function registrarCierreSesion(req, res) {
  try {
    const { idUsuario, usuario } = req.body;
    const usuarioIdOrNombre = idUsuario ?? usuario;

    if (usuarioIdOrNombre == null) {
      return res.status(400).json({ message: 'El usuario es requerido', success: false });
    }

    await loginService.registrarCierreSesion(usuarioIdOrNombre, req.ip);
    return res.status(200).json({ message: 'Cierre de sesión registrado correctamente', success: true });
  } catch (error) {
    console.error('Error al registrar el cierre de sesión:', error);
    return res.status(500).json({ message: 'Error al registrar el cierre de sesión', success: false });
  }
}

async function validarCuentaBeneficiario(req, res) {
  try {
    const { numCuenta, usuario, contrasena } = req.body;
    if (!numCuenta?.trim() || !usuario?.trim() || !contrasena) {
      return res.status(400).json({
        message: 'Número de cuenta y credenciales son requeridos',
        success: false
      });
    }

    const result = await loginService.validarCuentaBeneficiario(
      numCuenta.trim(),
      usuario.trim(),
      contrasena
    );

    return res.status(result.esValido ? 200 : 400).json({
      message: result.esValido
        ? 'Cuenta y credenciales validadas correctamente'
        : 'La cuenta o las credenciales no son válidas',
      success: result.esValido,
      cantidadBeneficiariosActivos: result.cantidadBeneficiariosActivos,
      porcentajeDisponible: result.porcentajeDisponible,
      beneficiarios: result.beneficiarios
    });
  } catch (error) {
    console.error('Error al validar la cuenta beneficiario:', error);
    return res.status(500).json({
      message: 'Error al validar la cuenta beneficiario',
      success: false
    });
  }
}

async function registrarUsuarioCompleto(req, res) {
  try {
    const { persona, usuario, cuentasNuevas = [], beneficiario } = req.body;
    if (!persona || !usuario) {
      return res.status(400).json({
        message: 'Datos personales y credenciales son requeridos',
        success: false
      });
    }

    const registro = await loginService.registrarPersonaUsuario(req.ip, persona, usuario);

    if (registro.flagDocuIdentidadExiste) {
      return res.status(409).json({
        message: 'La identidad ya se encuentra registrada',
        success: false,
        campo: 'documento'
      });
    }
    if (registro.flagTipoDocuExiste) {
      return res.status(400).json({
        message: 'El tipo de documento no existe',
        success: false
      });
    }
    if (registro.flagUsuarioExiste) {
      return res.status(409).json({
        message: 'El nombre de usuario ya existe',
        success: false,
        campo: 'usuario'
      });
    }
    if (registro.flagError || !registro.idUsuarioCreado) {
      return res.status(500).json({
        message: 'No se pudo completar el registro de la persona y el usuario',
        success: false
      });
    }

    const cuentasCreadas = [];
    for (const cuenta of cuentasNuevas) {
      const saldo = Number(cuenta.saldo);
      if (!cuenta.idTipoCuenta || !Number.isFinite(saldo) || saldo < 0) {
        return res.status(400).json({
          message: 'Hay una cuenta nueva con datos inválidos',
          success: false
        });
      }

      const creada = await loginService.crearCuentaDeRegistro(
        registro.idUsuarioCreado,
        req.ip,
        persona.ValorDocumentoIdentidad,
        cuenta.idTipoCuenta,
        saldo
      );
      if (creada.flagError || !creada.numCuenta) {
        return res.status(500).json({
          message: 'La persona y el usuario fueron creados, pero no se pudo crear todas las cuentas',
          success: false,
          idUsuarioCreado: registro.idUsuarioCreado
        });
      }
      cuentasCreadas.push({ numCuenta: creada.numCuenta, idTipoCuenta: cuenta.idTipoCuenta, saldo });
    }

    if (beneficiario) {
      const porcentaje = Number(beneficiario.porcentaje);
      if (!Number.isInteger(porcentaje) || porcentaje < 1 || porcentaje > 100) {
        return res.status(400).json({
          message: 'El porcentaje de beneficiario no es válido',
          success: false
        });
      }

      const cuentaValidada = await loginService.validarCuentaBeneficiario(
        beneficiario.numCuenta,
        beneficiario.usuarioAsociado,
        beneficiario.contrasenaAsociada
      );
      if (!cuentaValidada.esValido) {
        return res.status(400).json({
          message: 'Las credenciales del beneficiario no fueron validadas',
          success: false
        });
      }
      if (cuentaValidada.cantidadBeneficiariosActivos >= 3) {
        return res.status(400).json({
          message: 'La cuenta ya tiene los 3 beneficiarios permitidos.',
          success: false
        });
      }
      if (cuentaValidada.cantidadBeneficiariosActivos === 0 && porcentaje !== 100) {
        return res.status(400).json({
          message: 'Cuando no hay beneficiarios, el nuevo beneficiario debe recibir el 100%.',
          success: false
        });
      }
      if (cuentaValidada.cantidadBeneficiariosActivos > 0 && porcentaje >= 100) {
        return res.status(400).json({
          message: 'Debe reservar al menos un porcentaje para redistribuirlo entre los beneficiarios existentes.',
          success: false
        });
      }

      const beneficiarioResultado = await loginService.insertarBeneficiarioRegistro(
        registro.idUsuarioCreado,
        req.ip,
        beneficiario.numCuenta,
        persona.ValorDocumentoIdentidad,
        beneficiario.idParentesco,
        porcentaje
      );
      if (beneficiarioResultado.flagError) {
        return res.status(400).json({
          message: beneficiarioResultado.message || 'No se pudo registrar el beneficiario',
          success: false
        });
      }
    }

    return res.status(201).json({
      message: 'Registro completado correctamente',
      success: true,
      idUsuarioCreado: registro.idUsuarioCreado,
      cuentasCreadas
    });
  } catch (error) {
    console.error('Error al completar el registro:', error);
    return res.status(500).json({
      message: 'Error al completar el registro',
      success: false
    });
  }
}

module.exports = {
  validarUsuario,
  registrarCierreSesion,
  validarCuentaBeneficiario,
  registrarUsuarioCompleto
};
