output "kubernetes_cluster_id" {
  description = "DigitalOcean Kubernetes cluster ID."
  value       = digitalocean_kubernetes_cluster.swaroop.id
}

output "kubeconfig" {
  description = "Raw kubeconfig for the swaroop cluster (sensitive)."
  value       = digitalocean_kubernetes_cluster.swaroop.kube_config[0].raw_config
  sensitive   = true
}

output "database_host" {
  description = "Managed PostgreSQL hostname."
  value       = digitalocean_database_cluster.swaroop_db.host
}

output "database_port" {
  description = "Managed PostgreSQL port."
  value       = digitalocean_database_cluster.swaroop_db.port
}
