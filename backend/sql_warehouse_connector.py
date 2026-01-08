"""
SQL Warehouse Connector for H3 Geospatial Queries
Separate from Lakebase connector to query Unity Catalog tables
Uses Databricks SDK for better authentication handling in Apps
"""
import os
from databricks.sdk import WorkspaceClient
from databricks.sdk.service import sql as sdk_sql
import pandas as pd
from typing import Optional
from fastapi import Request
import time


def execute_sql_warehouse_query(query: str, request: Optional[Request] = None) -> pd.DataFrame:
    """
    Execute a SQL query on Databricks SQL Warehouse using SDK and return results as DataFrame
    Uses Databricks SDK which handles authentication automatically in Apps context
    
    Args:
        query: SQL query to execute
        request: FastAPI Request object (not used, kept for compatibility)
        
    Returns:
        pandas DataFrame with query results
    """
    import traceback
    
    try:
        DATABRICKS_WAREHOUSE_ID = os.getenv("DATABRICKS_WAREHOUSE_ID")
        
        if not DATABRICKS_WAREHOUSE_ID:
            print("ERROR: DATABRICKS_WAREHOUSE_ID environment variable not set")
            raise ValueError("DATABRICKS_WAREHOUSE_ID environment variable not set")
        
        print(f"DATABRICKS_WAREHOUSE_ID: {DATABRICKS_WAREHOUSE_ID}")
        print(f"Query preview: {query[:200]}...")
        
        # Use Databricks SDK - it handles authentication automatically in Apps
        print("Creating WorkspaceClient for SQL execution...")
        w = WorkspaceClient()
        
        print(f"Executing query on warehouse {DATABRICKS_WAREHOUSE_ID}...")
        # Execute the query using SDK
        result = w.statement_execution.execute_statement(
            warehouse_id=DATABRICKS_WAREHOUSE_ID,
            statement=query,
            wait_timeout="50s"  # Maximum allowed wait time
        )
        
        print("Query executed, processing results...")
        
        # Extract column names and data from result
        if not result.manifest or not result.manifest.schema or not result.manifest.schema.columns:
            print("No data returned from query")
            return pd.DataFrame()
        
        columns = [col.name for col in result.manifest.schema.columns]
        print(f"Columns: {columns}")
        
        # Extract rows from result
        rows = []
        if result.result and result.result.data_array:
            for row_data in result.result.data_array:
                # row_data is already a list of values
                rows.append(row_data)
            print(f"Fetched {len(rows)} rows")
        else:
            print("No rows in result")
        
        df = pd.DataFrame(rows, columns=columns)
        print(f"✓ Query completed successfully - returned {len(df)} rows")
        return df
        
    except Exception as e:
        print(f"ERROR in execute_sql_warehouse_query: {type(e).__name__}: {str(e)}")
        print("Full traceback:")
        print(traceback.format_exc())
        raise

