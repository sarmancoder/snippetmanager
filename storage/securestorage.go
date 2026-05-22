package storage

import (
	"github.com/zalando/go-keyring"
)

type SecureStorageService struct {
	serviceName string
}

func NewSecureStorageService() *SecureStorageService {
	return &SecureStorageService{
		serviceName: "aisnippets-store", // Identificador único de tu app
	}
}

// Guarda un secreto (ej. un token) asociado a un usuario o clave
func (s *SecureStorageService) SaveSecret(key string, secret string) error {
	err := keyring.Set(s.serviceName, key, secret)
	if err != nil {
		return err
	}
	return nil
}

// Recupera el secreto
func (s *SecureStorageService) GetSecret(key string) (string, error) {
	secret, err := keyring.Get(s.serviceName, key)
	if err != nil {
		return "", err
	}
	return secret, nil
}

// Elimina el secreto
func (s *SecureStorageService) DeleteSecret(key string) error {
	err := keyring.Delete(s.serviceName, key)
	if err != nil {
		return err
	}
	return nil
}
