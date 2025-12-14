from typing import Dict, Any

from .train_service import get_training_status, get_training_results
from ..ml_core.Module6 import show_comparison_table, rank_algorithms


def get_model_results(dataset_id: str, version: str = None) -> Dict[str, Any]:
    """Get model comparison and ranking results."""
    status = get_training_status(dataset_id)
    if status != 'done':
        return {'status': status}

    training_data = get_training_results(dataset_id, version)
    if not training_data:
        return {'status': 'no_results'}

    results = training_data['results']
    versions = training_data['versions']
    # Get comparison table and ranking with defensive guards
    try:
        comparison = show_comparison_table(results)
    except Exception as e:
        comparison = []

    try:
        ranked = rank_algorithms(results)
    except Exception as e:
        ranked = []

    # Normalize outputs
    try:
        comparison_out = comparison.to_dict('records') if hasattr(comparison, 'to_dict') else comparison
    except Exception:
        comparison_out = []

    try:
        ranked_out = ranked.to_dict('records') if hasattr(ranked, 'to_dict') else ranked
    except Exception:
        ranked_out = ranked if isinstance(ranked, list) else []

    return {
        'status': 'done',
        'comparison': comparison_out,
        'ranked': ranked_out,
        'versions': versions
    }
