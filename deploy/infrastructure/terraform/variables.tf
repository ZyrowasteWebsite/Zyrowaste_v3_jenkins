variable "do_token" {
  description = "DigitalOcean API token (sensitive)."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "DigitalOcean region slug (default Bangalore)."
  type        = string
  default     = "blr1"
}

variable "k8s_version" {
  description = "DOKS Kubernetes version slug."
  type        = string
  default     = "1.29"
}

variable "node_size" {
  description = "Droplet size slug for the default node pool."
  type        = string
  default     = "s-2vcpu-4gb"
}

variable "node_count" {
  description = "Worker node count in the default pool."
  type        = number
  default     = 2
}

variable "db_size" {
  description = "Managed PostgreSQL cluster size slug."
  type        = string
  default     = "db-s-1vcpu-1gb"
}
