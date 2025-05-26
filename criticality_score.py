#!/usr/bin/env python3

"""
Local Criticality Score Calculator
Replicates OSSF criticality_score behavior for local repositories
Based on: https://github.com/ossf/criticality_score
Compatible with all platforms (Windows, macOS, Linux)
"""

import argparse
import os
import sys
import subprocess
import yaml
import re
from datetime import datetime, timedelta
from pathlib import Path
import json

class CriticalityScoreCalculator:
    def __init__(self):
        # Default OSSF Pike algorithm configuration
        self.weights = {
            'created_since': 1,
            'updated_since': -1,
            'contributor_count': 2,
            'org_count': 1,
            'commit_frequency': 1,
            'recent_releases_count': 0.5,
            'closed_issues_count': 0.5,
            'updated_issues_count': 0.5,
            'comment_frequency': 1,
            'dependents_count': 2
        }
        
        self.max_thresholds = {
            'created_since': 120,
            'updated_since': 120,
            'contributor_count': 5000,
            'org_count': 10,
            'commit_frequency': 1000,
            'recent_releases_count': 26,
            'closed_issues_count': 5000,
            'updated_issues_count': 5000,
            'comment_frequency': 15,
            'dependents_count': 500000
        }
        
        self.smaller_is_better = {
            'updated_since': True
        }
        
        self.config_file = None

    def load_yaml_config(self, config_file):
        """Load configuration from YAML file"""
        try:
            with open(config_file, 'r') as f:
                config = yaml.safe_load(f)
            
            if 'inputs' not in config:
                raise ValueError("No inputs section found in YAML")
            
            print(f"Loading configuration from: {config_file}")
            self.config_file = config_file
            
            # Clear existing configuration
            self.weights = {}
            self.max_thresholds = {}
            self.smaller_is_better = {}
            
            # Field mapping from OSSF names to internal names
            field_mapping = {
                'legacy.created_since': 'created_since',
                'legacy.updated_since': 'updated_since',
                'legacy.contributor_count': 'contributor_count',
                'legacy.org_count': 'org_count',
                'legacy.commit_frequency': 'commit_frequency',
                'legacy.recent_release_count': 'recent_releases_count',
                'legacy.updated_issues_count': 'updated_issues_count',
                'legacy.closed_issues_count': 'closed_issues_count',
                'legacy.issue_comment_frequency': 'comment_frequency',
                'legacy.github_mention_count': 'dependents_count'
            }
            
            for input_item in config['inputs']:
                field = input_item.get('field', '')
                weight = input_item.get('weight', 1)
                bounds = input_item.get('bounds', {})
                upper = bounds.get('upper', 1000)
                smaller_is_better_value = bounds.get('smaller_is_better', 'no')
                # Handle both boolean True and string 'yes'
                smaller_is_better = (smaller_is_better_value is True) or (smaller_is_better_value == 'yes')
                # Map field name
                internal_field = field_mapping.get(field, field.replace('legacy.', ''))
                
                self.weights[internal_field] = weight
                self.max_thresholds[internal_field] = upper
                if smaller_is_better:
                    self.smaller_is_better[internal_field] = True
            
            # Apply smaller_is_better logic (make weights negative)
            for field, is_smaller_better in self.smaller_is_better.items():
                if is_smaller_better and field in self.weights:
                    # Make weight negative, but avoid double negative
                    current_weight = abs(self.weights[field])
                    self.weights[field] = -current_weight
            
            print("Configuration loaded successfully")
            print("- Algorithm: weighted_arithmetic_mean")
            print()
            
        except ImportError:
            print("ERROR: PyYAML not installed. Install with: pip3 install PyYAML", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"ERROR: Failed to parse YAML: {e}", file=sys.stderr)
            sys.exit(1)

    def run_git_command(self, cmd, cwd=None):
        """Run git command and return output"""
        try:
            result = subprocess.run(
                cmd, 
                shell=True, 
                capture_output=True, 
                text=True, 
                cwd=cwd,
                check=False
            )
            return result.stdout.strip()
        except Exception as e:
            print(f"Error running git command '{cmd}': {e}", file=sys.stderr)
            return ""

    def months_between(self, date1_str, date2_str):
        """Calculate months between two dates"""
        try:
            date1 = datetime.strptime(date1_str, '%Y-%m-%d')
            date2 = datetime.strptime(date2_str, '%Y-%m-%d')
            diff = date2 - date1
            return int(diff.days / 30)
        except:
            return 0

    def normalize_score(self, value, max_threshold, weight):
        """Normalize score component"""
        value = float(value) if value else 0
        max_threshold = float(max_threshold)
        weight = float(weight)
        
        # Normalize the value (0 to 1)
        if weight < 0:  # For parameters where smaller is better
            if value > max_threshold:
                value = max_threshold
            normalized = 1 - (value / max_threshold)
        else:
            if value > max_threshold:
                value = max_threshold
            normalized = value / max_threshold
        
        # Apply weight but keep result positive for final aggregation
        result = normalized * abs(weight)
        return round(result, 6)

    def get_git_repo_info(self, repo_path):
        """Extract git repository information"""
        repo_path = Path(repo_path).resolve()
        
        if not (repo_path / '.git').exists():
            raise ValueError(f"{repo_path} is not a git repository")
        
        # Repository basic info
        repo_name = repo_path.name
        
        # Get creation and last update dates
        created_date = self.run_git_command(
            'git log --reverse --format="%ad" --date=format:"%Y-%m-%d" | head -1',
            cwd=repo_path
        )
        last_updated = self.run_git_command(
            'git log -1 --format="%ad" --date=format:"%Y-%m-%d"',
            cwd=repo_path
        )
        
        if not created_date or not last_updated:
            # Fallback for empty repositories
            current_date = datetime.now().strftime('%Y-%m-%d')
            created_date = created_date or current_date
            last_updated = last_updated or current_date
        
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # Calculate time-based metrics
        created_since = self.months_between(created_date, current_date)
        updated_since = self.months_between(last_updated, current_date)
        
        # Contributor analysis
        contributor_output = self.run_git_command('git shortlog -sn', cwd=repo_path)
        contributor_count = len([line for line in contributor_output.split('\n') if line.strip()])
        
        # Organization count (unique email domains)
        emails_output = self.run_git_command('git log --format="%ae"', cwd=repo_path)
        if emails_output:
            domains = set()
            for email in emails_output.split('\n'):
                if '@' in email:
                    domain = email.split('@')[-1]
                    domains.add(domain)
            org_count = len(domains) if domains else 1
        else:
            org_count = 1
        
        # Commit frequency (commits per week in last year)
        commits_last_year = self.run_git_command(
            'git rev-list --since="1 year ago" --count HEAD',
            cwd=repo_path
        )
        commits_last_year = int(commits_last_year) if commits_last_year.isdigit() else 0
        commit_frequency = round(commits_last_year / 52, 2)
        
        # Recent releases (tags)
        tags_output = self.run_git_command('git tag', cwd=repo_path)
        tags = [tag for tag in tags_output.split('\n') if tag.strip()]
        recent_releases_count = min(len(tags), 26)  # Cap at 26 like OSSF
        
        # Issues approximation (commit messages mentioning fixes)
        issue_keywords = ['fix', 'close', 'resolve', 'bug', '#[0-9]']
        grep_pattern = '|'.join(issue_keywords)
        closed_issues_output = self.run_git_command(
            f'git log --since="90 days ago" --grep="{grep_pattern}" --oneline',
            cwd=repo_path
        )
        closed_issues_count = len([line for line in closed_issues_output.split('\n') if line.strip()])
        updated_issues_count = closed_issues_count  # Approximate
        
        # Comment frequency (average words per commit message)
        commits_90days = self.run_git_command(
            'git rev-list --since="90 days ago" --count HEAD',
            cwd=repo_path
        )
        commits_90days = int(commits_90days) if commits_90days.isdigit() else 0
        
        if commits_90days > 0:
            commit_messages = self.run_git_command(
                'git log --since="90 days ago" --format="%s%n%b"',
                cwd=repo_path
            )
            word_count = len(commit_messages.split()) if commit_messages else 0
            comment_frequency = round(word_count / commits_90days, 2)
        else:
            comment_frequency = 1
        
        # Dependents count (approximate)
        dependents_count = 1  # Base score for local analysis
        
        # Check for package.json references
        for package_file in repo_path.rglob('package.json'):
            try:
                with open(package_file, 'r') as f:
                    content = f.read()
                    if repo_name in content:
                        dependents_count += 1
            except:
                pass
        
        # Check for requirements.txt references
        for req_file in repo_path.rglob('requirements.txt'):
            try:
                with open(req_file, 'r') as f:
                    content = f.read()
                    if repo_name in content:
                        dependents_count += 1
            except:
                pass
        
        # Get remote URL
        remote_url = self.run_git_command(
            'git config --get remote.origin.url',
            cwd=repo_path
        ) or "No remote origin"
        
        return {
            'repo_name': repo_name,
            'repo_path': str(repo_path),
            'remote_url': remote_url,
            'created_date': created_date,
            'last_updated': last_updated,
            'created_since': created_since,
            'updated_since': updated_since,
            'contributor_count': contributor_count,
            'org_count': org_count,
            'commit_frequency': commit_frequency,
            'recent_releases_count': recent_releases_count,
            'closed_issues_count': closed_issues_count,
            'updated_issues_count': updated_issues_count,
            'comment_frequency': comment_frequency,
            'dependents_count': dependents_count
        }

    def calculate_criticality_score(self, repo_info):
        """Calculate the criticality score for a repository"""
        print("=== Local Criticality Score Analysis ===")
        print(f"Repository: {repo_info['repo_path']}")
        print(f"Remote URL: {repo_info['remote_url']}")
        if self.config_file:
            print(f"Configuration: {self.config_file}")
        else:
            print("Configuration: Default OSSF (Pike algorithm)")
        print()
        
        # Display raw metrics
        print("=== Raw Metrics ===")
        print(f"repo.name: {repo_info['repo_name']}")
        print(f"repo.created_date: {repo_info['created_date']}")
        print(f"repo.last_updated: {repo_info['last_updated']}")
        print(f"legacy.created_since: {repo_info['created_since']} months")
        print(f"legacy.updated_since: {repo_info['updated_since']} months")
        print(f"legacy.contributor_count: {repo_info['contributor_count']}")
        print(f"legacy.org_count: {repo_info['org_count']}")
        print(f"legacy.commit_frequency: {repo_info['commit_frequency']} commits/week")
        print(f"legacy.recent_releases_count: {repo_info['recent_releases_count']}")
        print(f"legacy.closed_issues_count: {repo_info['closed_issues_count']}")
        print(f"legacy.updated_issues_count: {repo_info['updated_issues_count']}")
        print(f"legacy.comment_frequency: {repo_info['comment_frequency']}")
        print(f"legacy.dependents_count: {repo_info['dependents_count']}")
        print()
        
        # Calculate normalized scores
        print("=== Calculating Criticality Score ===")
        total_score = 0
        total_weight = 0
        
        for param in self.weights:
            weight = self.weights[param]
            max_threshold = self.max_thresholds[param]
            value = repo_info[param]
            
            normalized_score = self.normalize_score(value, max_threshold, weight)
            total_score += normalized_score
            total_weight += abs(weight)
            
            print(f"{param}: value={value}, max_threshold={max_threshold}, weight={weight}, normalized={normalized_score}")
        
        # Calculate final score
        final_score = round(total_score / total_weight, 5) if total_weight > 0 else 0
        
        print()
        print("=== Final Results ===")
        print(f"Total weighted score: {total_score}")
        print(f"Total weight: {total_weight}")
        print(f"default_score: {final_score}")
        print()
        
        # Interpretation
        if final_score > 0.8:
            print("🔴 HIGH CRITICALITY: This project appears to be highly critical")
        elif final_score > 0.6:
            print("🟡 MEDIUM CRITICALITY: This project has moderate criticality")
        elif final_score > 0.3:
            print("🟢 LOW CRITICALITY: This project has low criticality")
        else:
            print("⚪ MINIMAL CRITICALITY: This project has minimal criticality")
        
        print()
        print("=== Comparison with OSSF Parameters ===")
        print("Note: This is a local approximation. Actual OSSF scores consider:")
        print("- GitHub-specific metrics (stars, forks, watchers)")
        print("- Issue and PR activity from GitHub API")
        print("- Dependency graph data")
        print("- Cross-repository references")
        print()
        print("Your local analysis provides a baseline understanding.")
        
        return final_score

    def analyze_repository(self, repo_path):
        """Analyze a single repository"""
        try:
            repo_info = self.get_git_repo_info(repo_path)
            return self.calculate_criticality_score(repo_info)
        except Exception as e:
            print(f"Error analyzing repository {repo_path}: {e}", file=sys.stderr)
            return None

    def analyze_workspace(self, workspace_path):
        """Analyze all repositories in a workspace"""
        workspace_path = Path(workspace_path).resolve()
        
        print("=== Workspace Criticality Analysis ===")
        print(f"Analyzing all git repositories in: {workspace_path}")
        print()
        
        # Find all git repositories
        git_repos = []
        for git_dir in workspace_path.rglob('.git'):
            if git_dir.is_dir():
                repo_path = git_dir.parent
                git_repos.append(repo_path)
        
        if not git_repos:
            print(f"No git repositories found in {workspace_path}")
            return []
        
        scores = []
        for i, repo_path in enumerate(git_repos):
            if i > 0:
                print("=" * 82)
            score = self.analyze_repository(repo_path)
            if score is not None:
                scores.append((str(repo_path), score))
            print()
        
        return scores

def main():
    parser = argparse.ArgumentParser(
        description='Local Criticality Score Calculator - OSSF compatible',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s                              # Analyze current directory with default config
  %(prog)s /path/to/repo                # Analyze specific repository
  %(prog)s --workspace                  # Analyze all repos in current workspace
  %(prog)s --config custom.yml         # Use custom configuration
  %(prog)s --config original_pike.yml --workspace  # Use Pike config for workspace
        '''
    )
    
    parser.add_argument(
        'path',
        nargs='?',
        default='.',
        help='Path to repository (default: current directory)'
    )
    
    parser.add_argument(
        '--config',
        metavar='FILE',
        help='Use YAML configuration file for weights and thresholds'
    )
    
    parser.add_argument(
        '--workspace',
        action='store_true',
        help='Analyze all repos in current workspace'
    )
    
    args = parser.parse_args()
    
    # Initialize calculator
    calculator = CriticalityScoreCalculator()
    
    # Load configuration if provided
    if args.config:
        calculator.load_yaml_config(args.config)
    else:
        print("Using default OSSF configuration (original Pike algorithm)")
        print()
    
    # Analyze based on arguments
    if args.workspace:
        calculator.analyze_workspace(args.path)
    else:
        # Check if path is a directory or a specific repo
        path = Path(args.path).resolve()
        if (path / '.git').exists():
            calculator.analyze_repository(path)
        elif path.is_dir():
            # Look for git repos in the directory
            calculator.analyze_workspace(path)
        else:
            print(f"Error: {path} is not a valid directory or git repository")
            sys.exit(1)

if __name__ == '__main__':
    main()
