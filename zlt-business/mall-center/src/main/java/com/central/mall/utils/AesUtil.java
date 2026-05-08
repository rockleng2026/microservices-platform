package com.central.mall.utils;

import lombok.extern.slf4j.Slf4j;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * AES encryption utility for sensitive settings fields.
 * Uses AES-128-CBC mode with PKCS5Padding.
 * D-11: AES encryption storage for mall_settings sensitive fields.
 */
@Slf4j
public class AesUtil {

    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String AES = "AES";

    /**
     * Encrypt data using AES-128-CBC.
     *
     * @param data the plaintext to encrypt
     * @param key  16-character secret key (128-bit)
     * @return Base64-encoded encrypted string, or empty string on error
     */
    public static String encrypt(String data, String key) {
        if (data == null || key == null || key.length() != 16) {
            log.warn("AesUtil.encrypt: invalid parameters");
            return "";
        }
        try {
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), AES);
            IvParameterSpec iv = new IvParameterSpec(key.getBytes(StandardCharsets.UTF_8));
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, iv);
            byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            log.error("AesUtil.encrypt failed: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Decrypt AES-128-CBC encrypted data.
     *
     * @param encrypted Base64-encoded encrypted string
     * @param key       16-character secret key (128-bit)
     * @return decrypted plaintext, or empty string on error
     */
    public static String decrypt(String encrypted, String key) {
        if (encrypted == null || key == null || key.length() != 16) {
            log.warn("AesUtil.decrypt: invalid parameters");
            return "";
        }
        try {
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), AES);
            IvParameterSpec iv = new IvParameterSpec(key.getBytes(StandardCharsets.UTF_8));
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, iv);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encrypted));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("AesUtil.decrypt failed: {}", e.getMessage());
            return "";
        }
    }
}
