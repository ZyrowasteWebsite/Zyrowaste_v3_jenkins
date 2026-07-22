# Level 6 IaC — default provider: DigitalOcean (cost-effective).
# For AWS: use aws_eks_cluster + aws_eks_node_group; for GCP: google_container_cluster +
# google_container_node_pool. Mirror outputs (cluster id, kubeconfig, DB host) per provider.
resource "digitalocean_kubernetes_cluster" "swaroop" {
  name    = "swaroop"
  region  = var.region
  version = var.k8s_version

  node_pool {
    name       = "default"
    size       = var.node_size
    node_count = var.node_count
  }
}

resource "digitalocean_database_cluster" "swaroop_db" {
  name       = "swaroop-db"
  engine     = "pg"
  version    = "16"
  size       = var.db_size
  region     = var.region
  node_count = 1
}
